import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { useToast } from '../store/toast.js';
import { Button } from '../components/Button.js';
import { formatPrice } from '../utils/format.js';
import { iconMap } from '../utils/icons.js';

const { Star, Heart, Plus } = iconMap;

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export function ProductPage({ query }) {
  const { state, dispatch, isAdmin } = useStore();
  const { pushToast } = useToast();
  const id = query.get('id');
  const product = state.products.find((item) => item.id === id);
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const [ratingError, setRatingError] = React.useState('');
  const [ratingSuccess, setRatingSuccess] = React.useState('');
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState('');
  const imageInputRef = React.useRef(null);

  React.useEffect(() => {
    setSelectedRating(0);
    setRatingLoading(false);
    setRatingError('');
    setRatingSuccess('');
    setImageLoading(false);
    setImageError('');
  }, [id]);

  if (!product) {
    return html`
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black">Product not found</h1>
          <p className="mt-2 text-sm text-[hsl(var(--foreground))/0.68]">The item you selected is unavailable or the link is invalid.</p>
          <a href="#/shop" className="mt-6 inline-block rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white">Return to shop</a>
        </div>
      </div>
    `;
  }

  const related = state.products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  const isWishlisted = state.wishlist.includes(product.id);
  const ratingCount = Number(product.ratingCount || 0);
  const hasRealRating = ratingCount > 0 && Number(product.rating) > 0;

  const addToCart = () => {
    dispatch({ type: 'ADD_TO_CART', product });
    pushToast({ title: 'Added to cart', description: product.name });
  };

  const toggleWishlist = () => {
    dispatch({ type: 'TOGGLE_WISHLIST', id: product.id });
    pushToast({ title: isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist', description: product.name });
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || imageLoading) return;
    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      event.target.value = '';
      return;
    }
    setImageLoading(true);
    try {
      const image = await readImageFile(file);
      const updates = { ...product, image };
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(state.user?.token ? { Authorization: `Bearer ${state.user.token}` } : {}) },
          body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Image save failed');
        const saved = await res.json();
        dispatch({ type: 'UPDATE_PRODUCT', id: product.id, updates: saved });
        pushToast({ title: 'Image added', description: product.name });
      } catch (err) {
        dispatch({ type: 'UPDATE_PRODUCT', id: product.id, updates: { image } });
        pushToast({ title: 'Image added locally', description: product.name });
      }
    } catch (err) {
      setImageError(err.message || 'Could not load image. Please try another file.');
    } finally {
      setImageLoading(false);
      event.target.value = '';
    }
  };

  const submitRating = async (score) => {
    const nextScore = Math.max(1, Math.min(5, Number(score || 0)));
    if (!nextScore || ratingLoading) return;

    setSelectedRating(nextScore);
    setRatingLoading(true);
    setRatingError('');
    setRatingSuccess('');

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

      setRatingSuccess(`Thanks! You rated this product ${nextScore} star${nextScore > 1 ? 's' : ''}.`);
      pushToast({ title: 'Rating submitted', description: `${product.name} • ${nextScore} star${nextScore > 1 ? 's' : ''}` });
    } catch (err) {
      dispatch({ type: 'RATE_PRODUCT', id: product.id, score: nextScore });
      setRatingSuccess(`Thanks! Your ${nextScore}-star rating was saved on this device.`);
      pushToast({ title: 'Rating saved locally', description: product.name });
    } finally {
      setRatingLoading(false);
    }
  };

  return html`
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))] shadow-md" style=${{ background: product.gradient }}>
            ${product.image
              ? html`<img src=${product.image} alt=${product.name} className="h-full w-full object-cover" />`
              : html`
                <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 px-8 py-6 text-center text-white shadow-sm backdrop-blur-sm">
                  <div className="text-5xl font-black tracking-tight">${product.name.split(' ')[0]}</div>
                  <div className="mt-2 text-sm uppercase tracking-[0.2em] text-white/80">${product.type}</div>
                </div>
              `}
            ${isAdmin ? html`
              <button type="button" disabled=${imageLoading} onClick=${() => imageInputRef.current?.click()} className="token-ring absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[hsl(var(--card))/0.92] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] shadow-md backdrop-blur transition hover:-translate-y-0.5 disabled:opacity-60">
                <${Plus} className="h-4 w-4" />
                ${imageLoading ? 'Loading image...' : product.image ? 'Change image' : 'Add image'}
              </button>
            ` : null}
            <input ref=${imageInputRef} type="file" accept="image/*" disabled=${imageLoading} onChange=${handleImageSelect} className="sr-only" />
          </div>
          ${imageError ? html`<div className="rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-3 text-sm text-[hsl(var(--destructive))]">${imageError}</div>` : null}
          <div className="grid grid-cols-3 gap-4">
            ${[1, 2, 3].map((item) => html`
              <div key=${item} className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[hsl(var(--border))] shadow-sm" style=${{ background: product.gradient, opacity: 0.92 - item * 0.08 }}>
                ${product.image ? html`<img src=${product.image} alt=${product.name} className="h-full w-full object-cover opacity-90" />` : null}
              </div>
            `)}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm lg:p-8">
          <div className="mb-3 inline-flex rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">${product.badge}</div>
          <h1 className="text-3xl font-black tracking-tight">${product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="text-2xl font-bold">${formatPrice(product.price)}</div>
            <div className="flex items-center gap-1 text-sm text-[hsl(var(--foreground))/0.68]">
              <${Star} className=${`h-4 w-4 ${hasRealRating ? 'fill-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))/0.34]'}`} />
              <span>${hasRealRating ? `${Number(product.rating).toFixed(1)} from ${ratingCount} customer ratings` : 'No ratings yet — click a star to add yours'}</span>
            </div>
            ${product.status ? html`<span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--foreground))/0.78]">${product.status}</span>` : null}
          </div>
          <p className="mt-5 text-sm leading-7 text-[hsl(var(--foreground))/0.72]">${product.description}</p>

          <div className="mt-6 rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">Add your rating</div>
                <div className="text-xs text-[hsl(var(--foreground))/0.62]">No rating is added until you click one of the star buttons.</div>
              </div>
              <div className="flex items-center gap-1">
                ${[1, 2, 3, 4, 5].map((score) => html`
                  <button
                    key=${score}
                    type="button"
                    disabled=${ratingLoading}
                    onClick=${() => submitRating(score)}
                    className="token-ring rounded-full p-1.5 transition-transform duration-250 hover:scale-110 disabled:opacity-50"
                    aria-label=${`Add my ${score} star${score > 1 ? 's' : ''} rating`}
                    title=${`Add my ${score} star${score > 1 ? 's' : ''} rating`}
                  >
                    <${Star} className=${`h-5 w-5 ${selectedRating >= score ? 'fill-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))/0.28]'}`} />
                  </button>
                `)}
              </div>
            </div>
            <div className="mt-3 min-h-5 text-sm">
              ${ratingLoading ? html`<span className="text-[hsl(var(--foreground))/0.62]">Adding your rating...</span>` : null}
              ${ratingError ? html`<span className="text-[hsl(var(--destructive))]">${ratingError}</span>` : null}
              ${ratingSuccess ? html`<span className="text-[hsl(var(--primary))]">${ratingSuccess}</span>` : null}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold">Available colors</div>
            <div className="flex flex-wrap gap-2">
              ${product.colors.map((color) => html`<span key=${color} className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 py-1.5 text-sm">${color}</span>`)}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <${Button} onClick=${addToCart} className="flex-1">Add to Cart</${Button}>
            <${Button} onClick=${toggleWishlist} variant="secondary" className="flex-1">
              <${Heart} className=${`h-4 w-4 ${isWishlisted ? 'fill-[hsl(var(--primary))] text-[hsl(var(--primary))]' : ''}`} />
              Wishlist
            </${Button}>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-5 text-2xl font-black tracking-tight">Related products</div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${related.map((item) => html`
            <a key=${item.id} href=${`#/product?id=${encodeURIComponent(item.id)}`} className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition-all duration-250 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[var(--radius-md)]" style=${{ background: item.gradient }}>
                ${item.image ? html`<img src=${item.image} alt=${item.name} className="h-full w-full object-cover" loading="lazy" />` : null}
              </div>
              <div className="text-base font-semibold">${item.name}</div>
              <div className="mt-1 text-sm text-[hsl(var(--primary))]">${formatPrice(item.price)}</div>
            </a>
          `)}
        </div>
      </section>
    </div>
  `;
}
