import { html } from '../jsx.js';

export function NotFoundPage() {
  return html`
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-[hsl(var(--foreground))/0.68]">The page you requested does not exist in this storefront.</p>
        <a href="#/" className="mt-6 inline-block rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white">Go to homepage</a>
      </div>
    </div>
  `;
}