import React, { html } from '../jsx.js';
import { products as seedProducts, categories } from '../data/products.js';
import { ENABLE_BACKEND_API, CONTACT_CONFIG, apiUrl } from '../config.js';

const StoreContext = React.createContext(null);

function safeParse(value, fallback) { if (!value) return fallback; try { return JSON.parse(value); } catch (err) { return fallback; } }

function normalizeProduct(raw) {
  const colors = Array.isArray(raw?.colors) ? raw.colors : (typeof raw?.colors === 'string' ? raw.colors.split(',').map((c) => c.trim()).filter(Boolean) : []);
  const ratingCount = Number(raw?.ratingCount ?? raw?.rating_count ?? 0);
  const defaultHomeNames = ['Studio Laptop 14', 'Girls Floral Abaya', 'AeroPods Wireless', 'Nordic Lounge Chair'];
  return { id: raw.id, name: raw.name || 'Untitled product', price: Number(raw.price ?? 0), rating: Number(raw.rating ?? 0), ratingCount: Number.isFinite(ratingCount) ? Math.max(0, ratingCount) : 0, category: raw.category || 'electronics', type: raw.type || 'General', badge: raw.badge || 'New', description: raw.description || '', colors, gradient: raw.gradient || 'linear-gradient(135deg, hsl(220 14% 20%), hsl(220 14% 36%))', status: raw.status || 'available', image: raw.image || '', showOnHome: Boolean(raw.showOnHome ?? raw.show_on_home ?? defaultHomeNames.includes(raw.name)) };
}

function normalizeLanguage(language) { return ['en', 'am', 'ar'].includes(language) ? language : 'en'; }
function nextLanguage(language) { if (language === 'en') return 'am'; if (language === 'am') return 'ar'; return 'en'; }

function defaultOwnerProfile() {
  return { name: 'Yuyu Online Shopping Owner', email: CONTACT_CONFIG.email, phone: CONTACT_CONFIG.phone, businessName: 'Yuyu Online Shopping', address: 'Addis Ababa, Ethiopia' };
}

function defaultState() {
  const savedTheme = localStorage.getItem('yuyu-theme');
  const savedLanguage = localStorage.getItem('yuyu-language');
  const savedCart = safeParse(localStorage.getItem('yuyu-cart'), []);
  const savedWishlist = safeParse(localStorage.getItem('yuyu-wishlist'), []);
  const savedUser = safeParse(localStorage.getItem('yuyu-user'), null);
  const savedProducts = safeParse(localStorage.getItem('yuyu-products'), null);
  const savedOrders = safeParse(localStorage.getItem('yuyu-orders'), []);
  const savedLogo = localStorage.getItem('yuyu-branding-logo') || '';
  const savedOwnerProfile = safeParse(localStorage.getItem('yuyu-owner-profile'), defaultOwnerProfile());
  const initialProducts = Array.isArray(savedProducts) ? savedProducts.map(normalizeProduct) : seedProducts.map((p) => normalizeProduct(p));
  return { theme: savedTheme || 'light', language: normalizeLanguage(savedLanguage), user: savedUser, cart: Array.isArray(savedCart) ? savedCart : [], wishlist: Array.isArray(savedWishlist) ? savedWishlist : [], products: initialProducts, orders: Array.isArray(savedOrders) ? savedOrders : [], categories, brandingLogo: savedLogo, ownerProfile: { ...defaultOwnerProfile(), ...(savedOwnerProfile || {}) } };
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME': return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'TOGGLE_LANGUAGE': return { ...state, language: nextLanguage(state.language) };
    case 'SET_LANGUAGE': return { ...state, language: normalizeLanguage(action.language) };
    case 'SET_PRODUCTS': return { ...state, products: action.products.map(normalizeProduct) };
    case 'ADD_PRODUCT': return { ...state, products: [normalizeProduct(action.product), ...state.products] };
    case 'UPDATE_PRODUCT': return { ...state, products: state.products.map((item) => item.id === action.id ? normalizeProduct({ ...item, ...action.updates, id: action.id }) : item) };
    case 'RATE_PRODUCT': return { ...state, products: state.products.map((item) => { if (item.id !== action.id) return item; const currentCount = Number(item.ratingCount || 0); const currentRating = Number(item.rating || 0); const score = Math.max(1, Math.min(5, Number(action.score || 0))); const nextCount = currentCount + 1; const nextRating = Number((((currentRating * currentCount) + score) / nextCount).toFixed(1)); return normalizeProduct({ ...item, rating: nextRating, ratingCount: nextCount }); }) };
    case 'REMOVE_PRODUCT': return { ...state, products: state.products.filter((item) => item.id !== action.id) };
    case 'SET_ORDERS': return { ...state, orders: Array.isArray(action.orders) ? action.orders : [] };
    case 'ADD_ORDER': return { ...state, orders: [action.order, ...state.orders] };
    case 'SET_BRANDING_LOGO': return { ...state, brandingLogo: action.logo || '' };
    case 'SET_OWNER_PROFILE': return { ...state, ownerProfile: { ...state.ownerProfile, ...(action.profile || {}) } };
    case 'ADD_TO_CART': { const existing = state.cart.find((item) => item.id === action.product.id); return existing ? { ...state, cart: state.cart.map((item) => item.id === action.product.id ? { ...item, qty: item.qty + 1 } : item) } : { ...state, cart: [...state.cart, { ...action.product, qty: 1 }] }; }
    case 'UPDATE_CART_QTY': return { ...state, cart: state.cart.map((item) => item.id === action.id ? { ...item, qty: Math.max(1, action.qty) } : item) };
    case 'REMOVE_FROM_CART': return { ...state, cart: state.cart.filter((item) => item.id !== action.id) };
    case 'TOGGLE_WISHLIST': { const exists = state.wishlist.includes(action.id); return { ...state, wishlist: exists ? state.wishlist.filter((id) => id !== action.id) : [...state.wishlist, action.id] }; }
    case 'LOGIN': return { ...state, user: action.user };
    case 'LOGOUT': return { ...state, user: null };
    case 'CLEAR_CART': return { ...state, cart: [] };
    default: return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, null, () => defaultState());
  React.useEffect(() => { document.documentElement.classList.toggle('dark', state.theme === 'dark'); localStorage.setItem('yuyu-theme', state.theme); }, [state.theme]);
  React.useEffect(() => { document.documentElement.lang = state.language; document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr'; localStorage.setItem('yuyu-language', state.language); }, [state.language]);
  React.useEffect(() => { localStorage.setItem('yuyu-cart', JSON.stringify(state.cart)); }, [state.cart]);
  React.useEffect(() => { localStorage.setItem('yuyu-wishlist', JSON.stringify(state.wishlist)); }, [state.wishlist]);
  React.useEffect(() => { state.user ? localStorage.setItem('yuyu-user', JSON.stringify(state.user)) : localStorage.removeItem('yuyu-user'); }, [state.user]);
  React.useEffect(() => { localStorage.setItem('yuyu-products', JSON.stringify(state.products)); }, [state.products]);
  React.useEffect(() => { localStorage.setItem('yuyu-orders', JSON.stringify(state.orders)); }, [state.orders]);
  React.useEffect(() => { localStorage.setItem('yuyu-branding-logo', state.brandingLogo || ''); }, [state.brandingLogo]);
  React.useEffect(() => { localStorage.setItem('yuyu-owner-profile', JSON.stringify(state.ownerProfile)); }, [state.ownerProfile]);
  React.useEffect(() => { if (!ENABLE_BACKEND_API) return; let cancelled = false; (async () => { try { const res = await fetch(apiUrl('/api/products')); if (!res.ok) return; const data = await res.json(); if (!cancelled && Array.isArray(data) && data.length) dispatch({ type: 'SET_PRODUCTS', products: data }); } catch (err) {} })(); return () => { cancelled = true; }; }, []);
  const value = React.useMemo(() => ({ state, dispatch, isAdmin: state.user?.role === 'admin' }), [state]);
  return html`<${StoreContext.Provider} value=${value}>${children}</${StoreContext.Provider}>`;
}

export function useStore() { const context = React.useContext(StoreContext); if (!context) throw new Error('useStore must be used within StoreProvider'); return context; }
