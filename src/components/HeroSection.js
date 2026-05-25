import { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { Button } from './Button.js';
import { iconMap } from '../utils/icons.js';
import { formatPrice } from '../utils/format.js';

const { ArrowRight, Sparkles, ShieldCheck, Truck } = iconMap;

export function HeroSection() {
  const { state } = useStore();
  const homeProducts = state.products.filter((product) => product.showOnHome).slice(0, 4);
  const fallbackProducts = state.products.filter((product) => ['Studio Laptop 14', 'Girls Floral Abaya', 'AeroPods Wireless', 'Nordic Lounge Chair'].includes(product.name)).slice(0, 4);
  const heroProducts = homeProducts.length ? homeProducts : fallbackProducts;

  return html`
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <div className="hero-mesh overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))] shadow-lg">
        <div className="grid items-center gap-10 px-6 py-10 sm:px-8 md:px-10 lg:grid-cols-2 lg:px-14 lg:py-16">
          <div className="fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1.5 text-sm font-medium text-[hsl(var(--primary))]">
              <${Sparkles} className="h-4 w-4" />
              New season savings up to 30%
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Shop smarter with clean design and everyday essentials.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--foreground))/0.72] sm:text-lg">
              Discover premium electronics, stylish clothing, home solutions, and must-have accessories curated for modern living.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#/shop">
                <${Button} className="w-full sm:w-auto">
                  Start Shopping
                  <${ArrowRight} className="h-4 w-4" />
                </${Button}>
              </a>
              <a href="#/shop?category=electronics">
                <${Button} variant="secondary" className="w-full sm:w-auto">Explore Electronics</${Button}>
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.72] p-3">
                <${Truck} className="mb-2 h-5 w-5 text-[hsl(var(--primary))]" />
                <div className="text-sm font-semibold">Fast delivery</div>
                <div className="text-xs text-[hsl(var(--foreground))/0.62]">Reliable doorstep shipping</div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.72] p-3">
                <${ShieldCheck} className="mb-2 h-5 w-5 text-[hsl(var(--primary))]" />
                <div className="text-sm font-semibold">Secure checkout</div>
                <div className="text-xs text-[hsl(var(--foreground))/0.62]">Protected order flow</div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.72] p-3">
                <${Sparkles} className="mb-2 h-5 w-5 text-[hsl(var(--primary))]" />
                <div className="text-sm font-semibold">Curated picks</div>
                <div className="text-xs text-[hsl(var(--foreground))/0.62]">Quality-focused collection</div>
              </div>
            </div>
          </div>

          <div className="relative fade-in">
            <div className="grid grid-cols-2 gap-4">
              ${heroProducts.map((product, index) => html`
                <a key=${product.id} href=${`#/product?id=${encodeURIComponent(product.id)}`} className=${`${index % 2 === 1 ? 'mt-8 ' : ''}group rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.86] p-4 shadow-md transition-all duration-350 hover:-translate-y-1 hover:shadow-lg`}>
                  <div className="mb-3 aspect-square overflow-hidden rounded-[var(--radius-md)]" style=${{ background: product.gradient }}>
                    ${product.image ? html`<img src=${product.image} alt=${product.name} className="h-full w-full object-cover transition-transform duration-350 group-hover:scale-105" />` : null}
                  </div>
                  <div className="text-sm font-semibold">${product.name}</div>
                  <div className="text-sm text-[hsl(var(--primary))]">${formatPrice(product.price)}</div>
                </a>
              `)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
