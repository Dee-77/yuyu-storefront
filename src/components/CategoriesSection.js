import { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { CategoryCard } from './CategoryCard.js';
import { electronicsSubcategories, clothesGroups } from '../data/products.js';

export function CategoriesSection() {
  const { state } = useStore();

  return html`
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Categories</div>
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Shop by category</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--foreground))/0.68]">
          Navigate quickly through Yuyu Online Shopping collections, including detailed electronics and clothing selections.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        ${state.categories.map((category) => html`<div key=${category.id}><${CategoryCard} category=${category} /></div>`)}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <h3 className="text-lg font-bold">Electronics subcategories</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            ${electronicsSubcategories.map((item) => html`<span key=${item} className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))/0.74]">${item}</span>`)}
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <h3 className="text-lg font-bold">Clothing highlights</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <div className="mb-2 text-sm font-semibold text-[hsl(var(--primary))]">Boys</div>
              <div className="space-y-2 text-sm text-[hsl(var(--foreground))/0.72]">
                ${clothesGroups.boys.map((item) => html`<div key=${item}>${item}</div>`)}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-[hsl(var(--primary))]">Girls</div>
              <div className="space-y-2 text-sm text-[hsl(var(--foreground))/0.72]">
                ${clothesGroups.girls.map((item) => html`<div key=${item}>${item}</div>`)}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-[hsl(var(--primary))]">For Both</div>
              <div className="space-y-2 text-sm text-[hsl(var(--foreground))/0.72]">
                ${clothesGroups.both.map((item) => html`<div key=${item}>${item}</div>`)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}