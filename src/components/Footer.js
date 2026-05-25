import { html } from '../jsx.js';
import { useStore } from '../store/store.js';

export function Footer() {
  const { state } = useStore();
  return html`
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[hsl(var(--primary))] text-white shadow-md">
              ${state.brandingLogo ? html`<img src=${state.brandingLogo} alt="Yuyu logo" className="h-full w-full object-cover" />` : html`<span className="text-lg font-black">Y</span>`}
            </div>
            <div>
              <div className="font-semibold">Yuyu Online Shopping</div>
              <div className="text-sm text-[hsl(var(--foreground))/0.62]">Modern essentials for home, style, and tech.</div>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[hsl(var(--foreground))/0.72]">
            Explore curated electronics, clothing, kitchen materials, furniture, and home & car accessories in a clean shopping experience designed for speed and comfort.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Shop</h3>
          <div className="space-y-2 text-sm text-[hsl(var(--foreground))/0.72]">
            <a className="block hover:text-[hsl(var(--foreground))]" href="#/shop?category=electronics">Electronics</a>
            <a className="block hover:text-[hsl(var(--foreground))]" href="#/shop?category=clothes">Clothes</a>
            <a className="block hover:text-[hsl(var(--foreground))]" href="#/shop?category=furniture">Furniture</a>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Account</h3>
          <div className="space-y-2 text-sm text-[hsl(var(--foreground))/0.72]">
            <a className="block hover:text-[hsl(var(--foreground))]" href="#/auth">Login / Signup</a>
            <a className="block hover:text-[hsl(var(--foreground))]" href="#/cart">Cart</a>
            <a className="block hover:text-[hsl(var(--foreground))]" href="#/checkout">Checkout</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--border))] px-4 py-4 text-center text-sm text-[hsl(var(--foreground))/0.58] sm:px-6 lg:px-8">
        © 2026 Yuyu Online Shopping. Designed for a polished storefront experience.
      </div>
    </footer>
  `;
}