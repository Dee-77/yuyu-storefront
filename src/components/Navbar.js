import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { iconMap } from '../utils/icons.js';
import { getCartCount } from '../utils/format.js';
import { t } from '../i18n.js';

const { Moon, SunMedium, Search, ShoppingBag, UserCircle2, Menu, X, Heart, LayoutDashboard, PackageCheck, Languages } = iconMap;
const languageLabels = { en: 'EN', am: 'አማ', ar: 'عر' };

export function Navbar() {
  const { state, dispatch, isAdmin } = useStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const tr = (key) => t(state.language, key);

  const cartCount = getCartCount(state.cart);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    window.location.hash = term ? `#/shop?search=${encodeURIComponent(term)}` : '#/shop';
    setMenuOpen(false);
  };

  return html`
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))/0.86] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#/" className="flex items-center gap-3 rounded-[var(--radius-md)] px-1 py-1 transition-all duration-250 hover:opacity-90" aria-label="Yuyu Online Shopping home">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[hsl(var(--primary))] text-white shadow-md sm:h-12 sm:w-12">
            ${state.brandingLogo ? html`<img src=${state.brandingLogo} alt="Yuyu logo" className="h-full w-full object-cover" />` : html`<${PackageCheck} className="h-6 w-6" />`}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-none">Yuyu Online</div>
            <div className="text-xs text-[hsl(var(--foreground))/0.62]">Shopping</div>
          </div>
        </a>

        <form onSubmit=${handleSearch} className="hidden flex-1 md:block">
          <div className="relative">
            <${Search} className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))/0.55]" />
            <input value=${search} onInput=${(e) => setSearch(e.target.value)} placeholder=${tr('searchPlaceholder')} className="token-ring h-11 w-full rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-11 pr-4 text-sm outline-none transition-all duration-250 placeholder:text-[hsl(var(--foreground))/0.45] focus:border-[hsl(var(--primary))/0.5]" />
          </div>
        </form>

        <nav className="hidden items-center gap-2 md:flex">
          <a href="#/shop" className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all duration-250 hover:bg-[hsl(var(--secondary))]">${tr('shop')}</a>
          <a href="#/shop?category=electronics" className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all duration-250 hover:bg-[hsl(var(--secondary))]">${tr('electronics')}</a>
          <a href="#/shop?category=clothes" className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all duration-250 hover:bg-[hsl(var(--secondary))]">${tr('clothes')}</a>
          <a href="#/contact" className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all duration-250 hover:bg-[hsl(var(--secondary))]">${tr('contact')}</a>
          ${isAdmin ? html`<a href="#/admin" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[hsl(var(--primary))] transition-all duration-250 hover:bg-[hsl(var(--secondary))]" title="Secure admin dashboard"><${LayoutDashboard} className="h-4 w-4" />${tr('admin')}</a>` : null}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          ${state.user ? html`<a href="#/auth" className="hidden rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-semibold sm:inline-flex">${isAdmin ? tr('admin') : state.user.name.split(' ')[0]}</a>` : null}
          <button onClick=${() => dispatch({ type: 'TOGGLE_LANGUAGE' })} className="token-ring inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-2 text-xs font-bold transition-all duration-250 hover:-translate-y-0.5 hover:shadow-sm" aria-label=${tr('toggleLanguage')} title="English / አማርኛ / العربية"><${Languages} className="h-4 w-4" />${languageLabels[state.language] || 'EN'}</button>
          <button onClick=${() => dispatch({ type: 'TOGGLE_THEME' })} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-sm" aria-label="Toggle theme">${state.theme === 'dark' ? html`<${SunMedium} className="h-4 w-4" />` : html`<${Moon} className="h-4 w-4" />`}</button>
          <a href="#/shop" className="relative rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-sm" aria-label="Wishlist"><${Heart} className="h-4 w-4" />${state.wishlist.length > 0 ? html`<span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[hsl(var(--primary))] px-1 text-[10px] font-bold text-white">${state.wishlist.length}</span>` : null}</a>
          <a href="#/cart" className="relative rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-sm" aria-label=${tr('cart')}><${ShoppingBag} className="h-4 w-4" />${cartCount > 0 ? html`<span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[hsl(var(--primary))] px-1 text-[10px] font-bold text-white">${cartCount}</span>` : null}</a>
          <a href="#/auth" className="hidden rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-sm sm:block" aria-label="User profile"><${UserCircle2} className="h-4 w-4" /></a>
          <button onClick=${() => setMenuOpen(!menuOpen)} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 md:hidden" aria-label="Toggle menu">${menuOpen ? html`<${X} className="h-4 w-4" />` : html`<${Menu} className="h-4 w-4" />`}</button>
        </div>
      </div>
      ${menuOpen ? html`<div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4 md:hidden"><form onSubmit=${handleSearch} className="mb-3"><div className="relative"><${Search} className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground))/0.55]" /><input value=${search} onInput=${(e) => setSearch(e.target.value)} placeholder=${tr('searchMobile')} className="token-ring h-11 w-full rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-11 pr-4 text-sm outline-none" /></div></form><div className="flex flex-col gap-1"><a href="#/" onClick=${() => setMenuOpen(false)} className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--secondary))]">${tr('home')}</a><a href="#/shop" onClick=${() => setMenuOpen(false)} className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--secondary))]">${tr('shop')}</a><a href="#/contact" onClick=${() => setMenuOpen(false)} className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--secondary))]">${tr('contact')}</a>${isAdmin ? html`<a href="#/admin" onClick=${() => setMenuOpen(false)} className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]">${tr('adminDashboard')}</a>` : null}<a href="#/cart" onClick=${() => setMenuOpen(false)} className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--secondary))]">${tr('cart')}</a><a href="#/auth" onClick=${() => setMenuOpen(false)} className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--secondary))]">${isAdmin ? tr('adminAccount') : tr('loginSignup')}</a></div></div>` : null}
    </header>
  `;
}
