import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { useToast } from '../store/toast.js';
import { iconMap } from '../utils/icons.js';
import { formatPrice } from '../utils/format.js';

const { Heart, Star, ShoppingBag } = iconMap;

export function ProductCard({ product }) {
  const { state, dispatch } = useStore();
  const { pushToast } = useToast();
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const isWishlisted = state.wishlist.includes(product.id);
  const ratingCount = Number(product.ratingCount || 0);
  const hasRealRating = ratingCount > 0 && Number(product.rating) > 0;

  React.useEffect(() => {
    setSelectedRating(0);
    setRatingLoading(false);
  }, [product.id]);

  const addToCart = () => {
    dispatch({ type: 'ADD_TO_CART', product });
    pushToast({ title: 'Added to cart', description: product.name });
  };

  const toggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', id: product.id });
    pushToast({ title: isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist', description: product.name });
  };

  const rateProduct = async (score) => {
    const nextScore = Math.max(1, Math.min(5, Number(score || 0)));
    if (!nextScore || ratingLoading) return;
    setSelectedRating(nextScore);
    setRatingLoading(true);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: nextScore })
      });
      if (res.ok) {
        const updated = await res.json();
        dispatch({ type: 'UPDATE_PRODUCT', id: product.id, updates: updated });
      } else {
        dispatch({ type: 'RATE_PRODUCT', id: product.id, score: nextScore });
      }
      pushToast({ title: 'Rating added', description: `${product.name} • ${nextScore} star${nextScore > 1 ? 's' : ''}` });
    } catch (err) {
      dispatch({ type: 'RATE_PRODUCT', id: product.id, score: nextScore });
      pushToast({ title: 'Rating saved locally', description: `${product.name} • ${nextScore} star${nextScore > 1 ? 's' : ''}` });
    } finally {
      setRatingLoading(false);
    }
  };

  return html`
    <div className="group product-sheen relative overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:shadow-md">
      <button
        onClick=${toggleWishlist}
        aria-label=${isWishlisted ? 'Unlike product' : 'Like product'}
        title=${isWishlisted ? 'Unlike product' : 'Like product'}
        className="token-ring absolute right-3 top-3 z-10 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.92] p-2 transition-all duration-250 hover:scale-105"
      >
        <${Heart} className=${`h-4 w-4 ${isWishlisted ? 'fill-[hsl(var(--primary))] text-[hsl(var(--primary))]' : ''}`} />
      </button>

      <a href=${`#/product?id=${encodeURIComponent(product.id)}`} className="block">
        <div className="relative mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[var(--radius-md)]" style=${{ background: product.gradient }}>
          ${product.image
            ? html`<img src=${product.image} alt=${product.name} className="h-full w-full object-cover" loading="lazy" />`
            : html`
              <div className="rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-4 py-3 text-center text-white shadow-sm backdrop-blur-sm">
                <div className="text-3xl font-black tracking-tight">${product.name.split(' ')[0]}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/80">${product.type}</div>
              </div>
            `}
        </div>
      </a>

      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[hsl(var(--primary))/0.12] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--primary))]">${product.badge}</span>
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--foreground))/0.68]" title=${hasRealRating ? `${ratingCount} customer ratings` : 'No customer ratings yet'}>
          <${Star} className=${`h-4 w-4 ${hasRealRating ? 'fill-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))/0.34]'}`} />
          <span>${hasRealRating ? `${Number(product.rating).toFixed(1)} (${ratingCount})` : 'No ratings'}</span>
        </div>
      </div>

      <a href=${`#/product?id=${encodeURIComponent(product.id)}`} className="block">
        <h3 className="line-clamp-2 text-base font-semibold leading-6">${product.name}</h3>
      </a>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[hsl(var(--foreground))/0.66]">${product.description}</p>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-[var(--radius-md)] bg-[hsl(var(--secondary))] px-3 py-2">
        <span className="text-xs font-semibold text-[hsl(var(--foreground))/0.62]">Rate</span>
        <div className="flex items-center gap-0.5">
          ${[1, 2, 3, 4, 5].map((score) => html`
            <button
              key=${score}
              type="button"
              disabled=${ratingLoading}
              onClick=${() => rateProduct(score)}
              className="token-ring rounded-full p-0.5 transition-transform duration-250 hover:scale-110 disabled:opacity-50"
              aria-label=${`Rate ${product.name} ${score} star${score > 1 ? 's' : ''}`}
              title=${`Rate ${score} star${score > 1 ? 's' : ''}`}
            >
              <${Star} className=${`h-4 w-4 ${selectedRating >= score ? 'fill-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))/0.30]'}`} />
            </button>
          `)}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div>
          <div className="text-lg font-bold">${formatPrice(product.price)}</div>
          <div className="text-xs text-[hsl(var(--foreground))/0.55]">${product.colors.join(' • ')}</div>
        </div>
        <button onClick=${addToCart} className="token-ring inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[hsl(var(--foreground))] px-3 py-2 text-sm font-semibold text-white transition-all duration-250 hover:opacity-90">
          <${ShoppingBag} className="h-4 w-4" />
          <span>Add</span>
        </button>
      </div>
    </div>
  `;
}
