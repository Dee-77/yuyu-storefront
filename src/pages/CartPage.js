import { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { getCartTotal, formatPrice } from '../utils/format.js';
import { iconMap } from '../utils/icons.js';

const { Plus, Minus, Trash2 } = iconMap;

export function CartPage() {
  const { state, dispatch } = useStore();
  const total = getCartTotal(state.cart);

  if (state.cart.length === 0) {
    return html`
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center shadow-sm">
          <h1 className="text-3xl font-black tracking-tight">Your cart is empty</h1>
          <p className="mt-3 text-sm text-[hsl(var(--foreground))/0.68]">Add products you love and they will appear here for a smooth checkout.</p>
          <a href="#/shop" className="mt-6 inline-block rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white">Continue shopping</a>
        </div>
      </div>
    `;
  }

  return html`
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Cart</div>
        <h1 className="text-3xl font-black tracking-tight">Your shopping bag</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-4">
          ${state.cart.map((item) => html`
            <div key=${item.id} className="grid gap-4 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm sm:grid-cols-[120px,1fr]">
              <div className="aspect-square rounded-[var(--radius-md)]" style=${{ background: item.gradient }}></div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold">${item.name}</div>
                  <div className="mt-1 text-sm text-[hsl(var(--foreground))/0.68]">${item.type}</div>
                  <div className="mt-2 text-base font-bold">${formatPrice(item.price)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-[var(--radius-md)] border border-[hsl(var(--border))]">
                    <button onClick=${() => dispatch({ type: 'UPDATE_CART_QTY', id: item.id, qty: item.qty - 1 })} className="token-ring p-2.5"><${Minus} className="h-4 w-4" /></button>
                    <span className="min-w-10 text-center text-sm font-semibold">${item.qty}</span>
                    <button onClick=${() => dispatch({ type: 'UPDATE_CART_QTY', id: item.id, qty: item.qty + 1 })} className="token-ring p-2.5"><${Plus} className="h-4 w-4" /></button>
                  </div>
                  <button onClick=${() => dispatch({ type: 'REMOVE_FROM_CART', id: item.id })} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] p-2.5 text-[hsl(var(--destructive))]">
                    <${Trash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          `)}
        </div>

        <aside className="h-fit rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-[hsl(var(--foreground))/0.68]">Subtotal</span><span>${formatPrice(total)}</span></div>
            <div className="flex items-center justify-between"><span className="text-[hsl(var(--foreground))/0.68]">Shipping</span><span>${formatPrice(12)}</span></div>
            <div className="flex items-center justify-between"><span className="text-[hsl(var(--foreground))/0.68]">Tax</span><span>${formatPrice(Math.round(total * 0.08))}</span></div>
          </div>
          <div className="my-5 h-px bg-[hsl(var(--border))]"></div>
          <div className="flex items-center justify-between text-base font-bold">
            <span>Total</span>
            <span>${formatPrice(total + 12 + Math.round(total * 0.08))}</span>
          </div>
          <a href="#/checkout" className="mt-6 block rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-3 text-center text-sm font-semibold text-white">Proceed to checkout</a>
        </aside>
      </div>
    </div>
  `;
}