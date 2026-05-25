import { html } from './jsx.js';
import { StoreProvider } from './store/store.js';
import { ToastProvider } from './store/toast.js';

export function Providers({ children }) {
  return html`
    <${StoreProvider}>
      <${ToastProvider}>${children}</${ToastProvider}>
    </${StoreProvider}>
  `;
}