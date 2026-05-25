import { html } from '../jsx.js';
import { useToast } from '../store/toast.js';
import { iconMap } from '../utils/icons.js';

const { BadgeCheck } = iconMap;

export function ToastViewport() {
  const { toasts } = useToast();

  return html`
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:w-full">
      ${toasts.map((toast) => html`
        <div key=${toast.id} className="fade-in pointer-events-auto rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))]">
              <${BadgeCheck} className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">${toast.title}</div>
              ${toast.description ? html`<div className="mt-1 text-sm text-[hsl(var(--foreground))/0.68]">${toast.description}</div>` : null}
            </div>
          </div>
        </div>
      `)}
    </div>
  `;
}