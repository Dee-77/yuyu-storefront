import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { useToast } from '../store/toast.js';
import { apiUrl } from '../config.js';
import { getCartTotal, formatPrice } from '../utils/format.js';

const PHONE_RE = /^[+()\-\s\d]{7,}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function CheckoutPage() {
  const { state, dispatch } = useStore();
  const { pushToast } = useToast();
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', address: '', city: '', paymentMethod: 'inperson' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const subtotal = getCartTotal(state.cart);
  const shipping = state.cart.length ? 12 : 0;
  const tax = state.cart.length ? Math.round(subtotal * 0.08) : 0;
  const total = subtotal + shipping + tax;
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const placeOrder = async () => {
    setError(''); setSuccess('');
    if (!state.cart.length) { setError('Your cart is empty. Add products before checkout.'); return; }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) { setError('Please enter your name, email, address, city, and phone number.'); return; }
    if (!EMAIL_RE.test(form.email.trim())) { setError('Please enter a valid email address.'); return; }
    if (!PHONE_RE.test(form.phone.trim())) { setError('Please enter a valid phone number so we can contact you about your order.'); return; }
    setLoading(true);
    const order = { id: `local-order-${Date.now()}`, createdAt: new Date().toISOString(), name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), address: form.address.trim(), city: form.city.trim(), paymentMethod: form.paymentMethod, items: state.cart.map((item) => ({ id: item.id, name: item.name, price: item.price, qty: item.qty, type: item.type })), total, status: 'new' };
    try {
      const res = await fetch(apiUrl('/api/orders'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
      if (!res.ok) throw new Error('Order could not be sent to the store dashboard.');
      const data = await res.json();
      dispatch({ type: 'ADD_ORDER', order: data.order || order });
      dispatch({ type: 'CLEAR_CART' });
      setSuccess('Order placed. We received your order details and will contact you about delivery.');
      pushToast({ title: 'Order placed', description: 'We will contact you to confirm delivery' });
    } catch (err) {
      setError(err.message || 'Order could not be sent. Please try again.');
    } finally { setLoading(false); }
  };

  return html`
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8"><div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Checkout</div><h1 className="text-3xl font-black tracking-tight">Checkout</h1></div>
      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <section className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <h2 className="text-lg font-bold">Order details</h2>
            <p className="mt-1 text-sm text-[hsl(var(--foreground))/0.62]">Enter your delivery and contact details so we can confirm your order.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input disabled=${loading} value=${form.name} onInput=${(e) => setField('name', e.target.value)} required aria-label="Full name" className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" placeholder="Full name *" />
              <input disabled=${loading} value=${form.email} onInput=${(e) => setField('email', e.target.value)} required aria-label="Email address" type="email" className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" placeholder="Email address *" />
              <input disabled=${loading} value=${form.address} onInput=${(e) => setField('address', e.target.value)} required aria-label="Address" className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60 sm:col-span-2" placeholder="Address *" />
              <input disabled=${loading} value=${form.city} onInput=${(e) => setField('city', e.target.value)} required aria-label="City" className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" placeholder="City *" />
              <input disabled=${loading} value=${form.phone} onInput=${(e) => setField('phone', e.target.value)} required aria-label="Phone number" type="tel" inputMode="tel" className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" placeholder="Phone number *" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-sm font-semibold"><input type="radio" name="paymentMethod" value="inperson" checked=${form.paymentMethod === 'inperson'} onChange=${(e) => setField('paymentMethod', e.target.value)} className="mr-2" />Pay in person</label>
              <label className="rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-sm font-semibold"><input type="radio" name="paymentMethod" value="online" checked=${form.paymentMethod === 'online'} onChange=${(e) => setField('paymentMethod', e.target.value)} className="mr-2" />Pay online</label>
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h2 className="text-xl font-bold">Order review</h2>
          ${error ? html`<div className="mt-4 rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-3 text-sm text-[hsl(var(--destructive))]">${error}</div>` : null}
          ${success ? html`<div className="mt-4 rounded-[var(--radius-md)] bg-[hsl(var(--primary))/0.12] p-3 text-sm text-[hsl(var(--primary))]">${success}</div>` : null}
          <div className="mt-4 space-y-3">${state.cart.length === 0 ? html`<div className="text-sm text-[hsl(var(--foreground))/0.68]">Your cart is empty. Add products before checkout.</div>` : state.cart.map((item) => html`<div key=${item.id} className="flex items-center justify-between gap-3 text-sm"><span className="max-w-[220px] truncate text-[hsl(var(--foreground))/0.72]">${item.name} × ${item.qty}</span><span>${formatPrice(item.price * item.qty)}</span></div>`)}</div>
          <div className="my-5 h-px bg-[hsl(var(--border))]"></div><div className="space-y-3 text-sm"><div className="flex items-center justify-between"><span className="text-[hsl(var(--foreground))/0.68]">Subtotal</span><span>${formatPrice(subtotal)}</span></div><div className="flex items-center justify-between"><span className="text-[hsl(var(--foreground))/0.68]">Shipping</span><span>${formatPrice(shipping)}</span></div><div className="flex items-center justify-between"><span className="text-[hsl(var(--foreground))/0.68]">Tax</span><span>${formatPrice(tax)}</span></div></div>
          <div className="my-5 h-px bg-[hsl(var(--border))]"></div><div className="flex items-center justify-between text-base font-bold"><span>Total</span><span>${formatPrice(total)}</span></div>
          <button onClick=${placeOrder} disabled=${loading || !state.cart.length} className="mt-6 w-full rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">${loading ? 'Placing order...' : 'Place order'}</button>
        </aside>
      </div>
    </div>
  `;
}
