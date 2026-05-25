import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { ProductCard } from '../components/ProductCard.js';

export function ShopPage({ query }) {
  const { state } = useStore();
  const [price, setPrice] = React.useState(query.get('price') || 'all');
  const [type, setType] = React.useState(query.get('type') || 'all');
  const [category, setCategory] = React.useState(query.get('category') || 'all');

  const search = (query.get('search') || '').toLowerCase();

  const types = Array.from(new Set(state.products.map((item) => item.type)));

  const filtered = state.products.filter((product) => {
    const matchCategory = category === 'all' ? true : product.category === category;
    const matchType = type === 'all' ? true : product.type === type;
    const matchSearch = search ? `${product.name} ${product.type} ${product.description}`.toLowerCase().includes(search) : true;

    let matchPrice = true;
    if (price === 'under50') matchPrice = product.price < 50;
    if (price === '50to150') matchPrice = product.price >= 50 && product.price <= 150;
    if (price === '150plus') matchPrice = product.price > 150;

    return matchCategory && matchType && matchSearch && matchPrice;
  });

  return html`
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Shop</div>
        <h1 className="text-3xl font-black tracking-tight">Browse all products</h1>
        <p className="mt-2 text-sm text-[hsl(var(--foreground))/0.68]">Filter by category, price, and type to find the right item faster.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="h-fit rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <div className="mb-5 text-lg font-bold">Filters</div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select value=${category} onChange=${(e) => setCategory(e.target.value)} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none">
              <option value="all">All categories</option>
              ${state.categories.map((item) => html`<option key=${item.id} value=${item.id}>${item.name}</option>`)}
            </select>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium">Price</label>
            <select value=${price} onChange=${(e) => setPrice(e.target.value)} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none">
              <option value="all">All prices</option>
              <option value="under50">Under $50</option>
              <option value="50to150">$50 - $150</option>
              <option value="150plus">Above $150</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <select value=${type} onChange=${(e) => setType(e.target.value)} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none">
              <option value="all">All types</option>
              ${types.map((item) => html`<option key=${item} value=${item}>${item}</option>`)}
            </select>
          </div>
        </aside>

        <section>
          ${filtered.length === 0 ? html`
            <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-sm">
              <h2 className="text-xl font-bold">No products matched your filters</h2>
              <p className="mt-2 text-sm text-[hsl(var(--foreground))/0.68]">Try another category, widen the price range, or search with a different term.</p>
            </div>
          ` : html`
            <div className="mb-4 text-sm text-[hsl(var(--foreground))/0.65]">Showing ${filtered.length} products</div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              ${filtered.map((product) => html`<div key=${product.id}><${ProductCard} product=${product} /></div>`)}
            </div>
          `}
        </section>
      </div>
    </div>
  `;
}