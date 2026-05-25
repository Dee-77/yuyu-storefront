export function formatPrice(value) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0
  }).format(value);
}

export function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}