import { html } from '../jsx.js';
import { iconMap } from '../utils/icons.js';

export function CategoryCard({ category }) {
  const Icon = iconMap[category.icon];

  return html`
    <a
      href=${`#/shop?category=${encodeURIComponent(category.id)}`}
      className="group rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] text-white shadow-sm" style=${{ background: category.accent }}>
        <${Icon} className="h-6 w-6" />
      </div>
      <div className="mb-1 text-base font-semibold">${category.name}</div>
      <p className="text-sm leading-6 text-[hsl(var(--foreground))/0.68]">${category.description}</p>
      <div className="mt-4 text-sm font-medium text-[hsl(var(--primary))] transition-transform duration-250 group-hover:translate-x-1">Browse category →</div>
    </a>
  `;
}