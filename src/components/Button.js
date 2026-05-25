import { html } from '../jsx.js';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-[hsl(var(--primary))] text-white hover:opacity-95',
    secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
    ghost: 'bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    destructive: 'bg-[hsl(var(--destructive))] text-white hover:opacity-95'
  };

  return html`
    <button
      ...${props}
      className=${`token-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold transition-all duration-250 shadow-sm ${variants[variant]} ${className}`}
    >
      ${children}
    </button>
  `;
}