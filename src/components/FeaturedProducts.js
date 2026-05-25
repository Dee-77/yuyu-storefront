import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { ProductCard } from './ProductCard.js';

function SkeletonCard() {
  return html`
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm">
      <div className="skeleton mb-4 aspect-[4/3] rounded-[var(--radius-md)]"></div>
      <div className="skeleton mb-2 h-4 w-24 rounded"></div>
      <div className="skeleton mb-2 h-5 w-3/4 rounded"></div>
      <div className="skeleton mb-4 h-4 w-full rounded"></div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-5 w-16 rounded"></div>
          <div className="skeleton h-3 w-20 rounded"></div>
        </div>
        <div className="skeleton h-10 w-20 rounded-[var(--radius-md)]"></div>
      </div>
    </div>
  `;
}

export function FeaturedProducts() {
  const { state } = useStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const featured = state.products.slice(0, 8);

  return html`
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Featured products</div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Trending picks customers love</h2>
        </div>
        <a href="#/shop" className="text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-80">View all</a>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        ${loading
          ? Array.from({ length: 8 }).map((_, index) => html`<div key=${`s-${index}`}><${SkeletonCard} /></div>`)
          : featured.map((product) => html`<div key=${product.id}><${ProductCard} product=${product} /></div>`)}
      </div>
    </section>
  `;
}