import React, { html } from './jsx.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ToastViewport } from './components/ToastViewport.js';
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductPage } from './pages/ProductPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { ProfileManagementPage } from './pages/ProfileManagementPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { useStore } from './store/store.js';

const autoTranslationCache = new Map();
const TRANSLATABLE_PLACEHOLDER_SELECTOR = 'input[placeholder], textarea[placeholder]';

function isSkippableText(text) {
  const value = (text || '').trim();
  if (!value) return true;
  if (/^[\d\s.,:+()$€£¥/\\|•×%-]+$/.test(value)) return true;
  if (/^https?:\/\//i.test(value) || value.includes('@')) return true;
  return false;
}

function getTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || isSkippableText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('script, style, noscript, svg, input, textarea, select, [data-no-translate]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

async function translateBatch(values, targetLang) {
  const translator = window.genmb?.translate;
  if (!translator?.batch && !translator?.text) return values;
  const translated = [];
  const missing = [];
  const missingIndexes = [];

  values.forEach((value, index) => {
    const key = `${targetLang}:${value}`;
    if (autoTranslationCache.has(key)) translated[index] = autoTranslationCache.get(key);
    else { missing.push(value); missingIndexes.push(index); }
  });

  if (missing.length) {
    try {
      const results = translator.batch
        ? await translator.batch(missing, targetLang)
        : await Promise.all(missing.map(async (value) => (await translator.text(value, targetLang)).translated));
      results.forEach((result, index) => {
        const source = missing[index];
        const value = typeof result === 'string' ? result : result?.translated;
        const finalValue = value || source;
        autoTranslationCache.set(`${targetLang}:${source}`, finalValue);
        translated[missingIndexes[index]] = finalValue;
      });
    } catch (err) {
      missing.forEach((source, index) => { translated[missingIndexes[index]] = source; });
    }
  }

  return translated;
}

function AutoTranslate({ children }) {
  const { state } = useStore();
  const [status, setStatus] = React.useState('idle');
  const translateRun = React.useRef(0);

  React.useEffect(() => {
    const root = document.querySelector('main');
    if (!root || state.language === 'en') { setStatus('idle'); return; }
    const runId = ++translateRun.current;
    const timer = window.setTimeout(async () => {
      const textNodes = getTextNodes(root);
      const textValues = textNodes.map((node) => node.nodeValue.trim());
      const fields = Array.from(root.querySelectorAll(TRANSLATABLE_PLACEHOLDER_SELECTOR)).filter((field) => field.placeholder && !isSkippableText(field.placeholder));
      const placeholderValues = fields.map((field) => field.placeholder.trim());
      const allValues = [...textValues, ...placeholderValues];
      if (!allValues.length) return;
      setStatus('loading');
      try {
        const translated = await translateBatch(allValues, state.language);
        if (runId !== translateRun.current) return;
        textNodes.forEach((node, index) => {
          const original = textValues[index];
          node.nodeValue = node.nodeValue.replace(original, translated[index] || original);
        });
        fields.forEach((field, index) => {
          const translatedValue = translated[textValues.length + index];
          if (translatedValue) field.placeholder = translatedValue;
        });
        setStatus('done');
        window.setTimeout(() => { if (runId === translateRun.current) setStatus('idle'); }, 1200);
      } catch (err) {
        if (runId === translateRun.current) setStatus('error');
      }
    }, 80);
    return () => { window.clearTimeout(timer); };
  }, [state.language, children]);

  return html`
    <div>
      ${children}
      ${state.language !== 'en' && status === 'loading' ? html`<div className="pointer-events-none fixed bottom-4 left-4 z-50 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold shadow-md">Translating page...</div>` : null}
      ${state.language !== 'en' && status === 'error' ? html`<div className="pointer-events-none fixed bottom-4 left-4 z-50 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--destructive))] shadow-md">Some text could not be translated.</div>` : null}
    </div>
  `;
}

function useHashRoute() {
  const getHash = () => window.location.hash || '#/';
  const [hash, setHash] = React.useState(getHash);

  React.useEffect(() => {
    const onHashChange = () => setHash(getHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}

function parseRoute(hash) {
  const cleaned = hash.replace(/^#/, '') || '/';
  const [path, queryString] = cleaned.split('?');
  const query = new URLSearchParams(queryString || '');
  return { path, query };
}

export function App() {
  const hash = useHashRoute();
  const route = parseRoute(hash);

  let page = html`<${NotFoundPage} />`;

  if (route.path === '/' || route.path === '') {
    page = html`<${HomePage} />`;
  } else if (route.path === '/shop') {
    page = html`<${ShopPage} query=${route.query} />`;
  } else if (route.path === '/product') {
    page = html`<${ProductPage} query=${route.query} />`;
  } else if (route.path === '/cart') {
    page = html`<${CartPage} />`;
  } else if (route.path === '/checkout') {
    page = html`<${CheckoutPage} />`;
  } else if (route.path === '/auth') {
    page = html`<${AuthPage} />`;
  } else if (route.path === '/admin') {
    page = html`<${AdminDashboardPage} />`;
  } else if (route.path === '/admin/profile') {
    page = html`<${ProfileManagementPage} />`;
  } else if (route.path === '/contact') {
    page = html`<${ContactPage} />`;
  }

  return html`
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <${Navbar} />
      <${AutoTranslate}>
        <main>${page}</main>
        <${Footer} />
      </${AutoTranslate}>
      <${ToastViewport} />
    </div>
  `;
}
