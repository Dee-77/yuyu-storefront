from __future__ import annotations

import hashlib
import json
import os
import re
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Literal, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / '.env'
DATA_DIR = BASE_DIR / 'data'
PRODUCTS_FILE = DATA_DIR / 'products.json'
CONTACTS_FILE = DATA_DIR / 'contacts.json'
ORDERS_FILE = DATA_DIR / 'orders.json'
ADMIN_FILE = DATA_DIR / 'admin.json'

def load_env_file(path: Path = ENV_FILE) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value

load_env_file()

ADMIN_EMAIL = os.getenv('YUYU_ADMIN_EMAIL', '').strip().lower()
DEFAULT_ADMIN_PASSWORD = os.getenv('YUYU_ADMIN_PASSWORD', '').strip()
TOKENS: set[str] = set()

DEFAULT_PRODUCTS = [
    {'id': 'p1', 'name': 'Nova Digital Watch S2', 'price': 59, 'rating': 4.7, 'ratingCount': 24, 'category': 'electronics', 'type': 'Watches', 'badge': 'Best Seller', 'description': 'A slim digital watch with bright display, step tracking, and a week-long battery.', 'colors': ['Midnight', 'Sand'], 'gradient': 'linear-gradient(135deg, hsl(220 20% 16%), hsl(220 26% 32%))', 'status': 'available', 'image': '', 'showOnHome': False},
    {'id': 'p2', 'name': 'AeroPods Wireless', 'price': 89, 'rating': 4.8, 'ratingCount': 31, 'category': 'electronics', 'type': 'AirPods', 'badge': 'New', 'description': 'Comfortable true wireless earbuds with clear voice pickup and fast charging.', 'colors': ['Cloud White'], 'gradient': 'linear-gradient(135deg, hsl(0 0% 98%), hsl(210 30% 88%))', 'status': 'available', 'image': '', 'showOnHome': True},
    {'id': 'p3', 'name': 'VoltMax 20W Charger', 'price': 24, 'rating': 4.6, 'ratingCount': 17, 'category': 'electronics', 'type': 'Chargers', 'badge': 'Fast Charge', 'description': 'Compact charging block for phones, earbuds, and tablets.', 'colors': ['Pearl'], 'gradient': 'linear-gradient(135deg, hsl(210 20% 96%), hsl(210 18% 84%))', 'status': 'available', 'image': '', 'showOnHome': False},
    {'id': 'p4', 'name': 'Everyday Street Sneakers', 'price': 54, 'rating': 4.6, 'ratingCount': 12, 'category': 'clothes', 'type': 'Shoes', 'badge': 'For All', 'description': 'Versatile lace-up sneakers with cushioned sole.', 'colors': ['Stone', 'Black'], 'gradient': 'linear-gradient(135deg, hsl(40 18% 88%), hsl(35 16% 74%))', 'status': 'available', 'image': '', 'showOnHome': False}
]

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
PHONE_RE = re.compile(r'^[+()\-\s\d]{7,}$')

class EmailModel(BaseModel):
    @field_validator('email', check_fields=False)
    @classmethod
    def valid_email(cls, value: str) -> str:
        if not EMAIL_RE.match(value):
            raise ValueError('Invalid email address')
        return value.lower()

class ProductBase(BaseModel):
    name: str = Field(min_length=2)
    price: float = Field(ge=0)
    rating: float = Field(ge=0, le=5)
    ratingCount: int = Field(default=0, ge=0)
    category: str = Field(min_length=2)
    type: str = Field(min_length=2)
    badge: str = ''
    description: str = ''
    colors: List[str] = Field(default_factory=list)
    gradient: str = 'linear-gradient(135deg, hsl(220 14% 20%), hsl(220 14% 36%))'
    status: Literal['available', 'finished', 'out-of-stock', 'coming-soon'] = 'available'
    image: str = ''
    showOnHome: bool = False

class ProductCreate(ProductBase):
    id: Optional[str] = None

class Product(ProductBase):
    id: str

class ProductStatusUpdate(BaseModel):
    status: Literal['available', 'finished', 'out-of-stock', 'coming-soon']

class ProductRatingPayload(BaseModel):
    score: int = Field(ge=1, le=5)

class LoginPayload(EmailModel):
    email: str
    password: str = Field(min_length=1)

class ChangePasswordPayload(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6)

class ContactPayload(EmailModel):
    name: str = Field(min_length=2, max_length=120)
    email: str
    message: str = Field(min_length=5, max_length=2000)

class OrderPayload(EmailModel):
    name: str = Field(min_length=2, max_length=160)
    email: str
    phone: str = Field(min_length=7, max_length=80)
    address: str = Field(min_length=5, max_length=300)
    city: str = Field(min_length=2, max_length=120)
    paymentMethod: Literal['online', 'inperson']
    items: List[dict] = Field(default_factory=list)
    total: float = Field(ge=0)

    @field_validator('phone')
    @classmethod
    def valid_phone(cls, value: str) -> str:
        cleaned = value.strip()
        if not PHONE_RE.match(cleaned):
            raise ValueError('A valid phone number is required')
        return cleaned

app = FastAPI(title='Yuyu Online Shopping API')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])

def hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 120000).hex()

def make_admin_record(email: str, password: str) -> dict:
    salt = secrets.token_hex(16)
    return {'email': email, 'salt': salt, 'password_hash': hash_password(password, salt)}

def default_admin_record() -> dict:
    if not ADMIN_EMAIL or not DEFAULT_ADMIN_PASSWORD:
        raise RuntimeError('Admin credentials must be configured with YUYU_ADMIN_EMAIL and YUYU_ADMIN_PASSWORD')
    return make_admin_record(ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)

def ensure_files() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not PRODUCTS_FILE.exists(): PRODUCTS_FILE.write_text(json.dumps(DEFAULT_PRODUCTS, indent=2), encoding='utf-8')
    if not CONTACTS_FILE.exists(): CONTACTS_FILE.write_text('[]', encoding='utf-8')
    if not ORDERS_FILE.exists(): ORDERS_FILE.write_text('[]', encoding='utf-8')
    if not ADMIN_FILE.exists(): ADMIN_FILE.write_text(json.dumps(default_admin_record(), indent=2), encoding='utf-8')

def read_json(path: Path, fallback):
    ensure_files()
    try: return json.loads(path.read_text(encoding='utf-8') or json.dumps(fallback))
    except json.JSONDecodeError:
        write_json(path, fallback); return fallback

def write_json(path: Path, data) -> None:
    ensure_files(); path.write_text(json.dumps(data, indent=2), encoding='utf-8')

def require_admin(authorization: str = Header(default='')):
    token = authorization.removeprefix('Bearer ').strip()
    if token not in TOKENS: raise HTTPException(status_code=401, detail='Admin authentication required')
    return True

def read_products() -> List[dict]: return read_json(PRODUCTS_FILE, [])
def write_products(items: List[dict]) -> None: write_json(PRODUCTS_FILE, items)

@app.get('/health')
def root_health(): return {'ok': True}

@app.get('/api/health')
def api_health(): return {'ok': True}

@app.post('/api/auth/login')
def login(payload: LoginPayload):
    if not ADMIN_EMAIL or not DEFAULT_ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail='Admin authentication is not configured. Add YUYU_ADMIN_EMAIL and YUYU_ADMIN_PASSWORD to backend/.env, then restart FastAPI.')
    admin = read_json(ADMIN_FILE, {})
    email_matches = payload.email.lower() == admin.get('email')
    password_matches = hash_password(payload.password, admin.get('salt', '')) == admin.get('password_hash')
    env_email_matches = payload.email.lower() == ADMIN_EMAIL
    env_password_matches = secrets.compare_digest(payload.password, DEFAULT_ADMIN_PASSWORD)
    if env_email_matches and env_password_matches and not (email_matches and password_matches):
        admin = make_admin_record(ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
        write_json(ADMIN_FILE, admin)
        email_matches = True
        password_matches = True
    if not (email_matches and password_matches):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = secrets.token_urlsafe(32); TOKENS.add(token)
    return {'token': token, 'email': admin['email'], 'role': 'admin'}

@app.post('/api/auth/change-password')
def change_password(payload: ChangePasswordPayload, _: bool = Depends(require_admin)):
    admin = read_json(ADMIN_FILE, {})
    if hash_password(payload.current_password, admin.get('salt', '')) != admin.get('password_hash'):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    salt = secrets.token_hex(16)
    write_json(ADMIN_FILE, {'email': admin.get('email', ADMIN_EMAIL), 'salt': salt, 'password_hash': hash_password(payload.new_password, salt)})
    return {'success': True}

@app.get('/api/products', response_model=List[Product])
def get_products(): return read_products()

@app.post('/api/products', response_model=Product)
def create_product(payload: ProductCreate, _: bool = Depends(require_admin)):
    items = read_products(); product = payload.model_dump(); product['id'] = payload.id or f"p-{uuid4().hex[:8]}"
    items.insert(0, product); write_products(items); return product

@app.put('/api/products/{product_id}', response_model=Product)
def update_product(product_id: str, payload: ProductBase, _: bool = Depends(require_admin)):
    items = read_products()
    for index, item in enumerate(items):
        if item['id'] == product_id:
            updated = payload.model_dump(); updated['id'] = product_id; items[index] = updated; write_products(items); return updated
    raise HTTPException(status_code=404, detail='Product not found')

@app.patch('/api/products/{product_id}/status', response_model=Product)
def update_product_status(product_id: str, payload: ProductStatusUpdate, _: bool = Depends(require_admin)):
    items = read_products()
    for index, item in enumerate(items):
        if item['id'] == product_id:
            items[index]['status'] = payload.status; write_products(items); return items[index]
    raise HTTPException(status_code=404, detail='Product not found')

@app.post('/api/products/{product_id}/rate', response_model=Product)
def rate_product(product_id: str, payload: ProductRatingPayload):
    items = read_products()
    for index, item in enumerate(items):
        if item['id'] == product_id:
            current_count = max(0, int(item.get('ratingCount', item.get('rating_count', 0)) or 0)); current_rating = float(item.get('rating', 0) or 0)
            new_count = current_count + 1; item['ratingCount'] = new_count; item['rating'] = round(((current_rating * current_count) + payload.score) / new_count, 1)
            items[index] = item; write_products(items); return item
    raise HTTPException(status_code=404, detail='Product not found')

@app.delete('/api/products/{product_id}')
def delete_product(product_id: str, _: bool = Depends(require_admin)):
    items = read_products(); remaining = [item for item in items if item['id'] != product_id]
    if len(remaining) == len(items): raise HTTPException(status_code=404, detail='Product not found')
    write_products(remaining); return {'success': True, 'deletedId': product_id}

@app.get('/api/orders')
def get_orders(_: bool = Depends(require_admin)): return read_json(ORDERS_FILE, [])

@app.post('/api/orders')
def create_order(payload: OrderPayload):
    orders = read_json(ORDERS_FILE, [])
    order = payload.model_dump(); order['id'] = f"o-{uuid4().hex[:8]}"; order['status'] = 'new'; order['createdAt'] = datetime.now(timezone.utc).isoformat()
    orders.insert(0, order); write_json(ORDERS_FILE, orders)
    return {'success': True, 'order': order}

@app.post('/api/contact')
def contact(payload: ContactPayload):
    contacts = read_json(CONTACTS_FILE, [])
    item = payload.model_dump(); item['id'] = f"c-{uuid4().hex[:8]}"; contacts.insert(0, item); write_json(CONTACTS_FILE, contacts)
    return {'success': True, 'id': item['id']}
