import React, { html } from '../jsx.js';

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const removeToast = React.useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = React.useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next = { id, title: toast.title, description: toast.description || '' };
    setToasts((current) => [...current, next]);
    window.setTimeout(() => removeToast(id), 2600);
  }, [removeToast]);

  return html`
    <${ToastContext.Provider} value=${{ toasts, pushToast, removeToast }}>
      ${children}
    </${ToastContext.Provider}>
  `;
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}