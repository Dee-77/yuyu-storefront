import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { useToast } from '../store/toast.js';
import { iconMap } from '../utils/icons.js';
import { t } from '../i18n.js';

const { Eye, EyeOff } = iconMap;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function AuthPage() {
  const { state, dispatch, isAdmin } = useStore();
  const { pushToast } = useToast();
  const [mode, setMode] = React.useState('login');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [message, setMessage] = React.useState('');
  const tr = (key) => t(state.language, key);

  const validate = (includePassword = true) => {
    const next = {};
    if (mode === 'signup' && !name.trim()) next.name = tr('nameRequired');
    if (!email.trim()) next.email = tr('emailRequired');
    else if (!EMAIL_RE.test(email.trim())) next.email = tr('invalidEmail');
    if (includePassword) {
      if (!password) next.password = tr('passwordRequired');
      else if (password.length < 6) next.password = tr('shortPassword');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrors({});
    if (!validate(true)) return;
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const user = { name: mode === 'signup' ? name.trim() : normalizedEmail.split('@')[0], email: normalizedEmail, role: 'customer' };
      dispatch({ type: 'LOGIN', user });
      pushToast({ title: mode === 'login' ? 'Welcome back' : 'Account created', description: user.name });
      window.location.hash = '#/';
    } catch (err) {
      setErrors({ form: err.message || tr('wrongPassword') });
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setErrors({});
    setMessage('');
    setLoading(true);
    try {
      if (!window.genmb?.auth) throw new Error('Authentication service is unavailable.');
      await window.genmb.auth.ready();
      const genmbUser = await window.genmb.auth.signIn();
      if (!genmbUser) return;
      const user = { name: genmbUser.name || genmbUser.email, email: genmbUser.email, role: 'customer', id: genmbUser.id, picture: genmbUser.picture };
      dispatch({ type: 'LOGIN', user });
      pushToast({ title: 'Signed in', description: user.name });
      window.location.hash = '#/';
    } catch (err) {
      setErrors({ form: err.message || 'Sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    setMessage('');
    setErrors({});
    if (!validate(false)) return;
    setLoading(true);
    try {
      if (!window.genmb?.auth) throw new Error('Authentication service is unavailable.');
      await window.genmb.auth.ready();
      await window.genmb.auth.sendMagicLink(email.trim().toLowerCase());
      setMessage(tr('checkEmail'));
    } catch (err) {
      setErrors({ form: err.message || 'Could not send sign-in link.' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (window.genmb?.auth) await window.genmb.auth.signOut();
    } catch (err) {
      pushToast({ title: 'Signed out locally', description: 'Remote sign-out was unavailable.' });
    } finally {
      dispatch({ type: 'LOGOUT' });
      setLoading(false);
    }
  };

  if (state.user) {
    return html`
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
          <div className="mb-3 inline-flex rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary))]">${isAdmin ? tr('adminSession') : tr('customerSession')}</div>
          <h1 className="text-3xl font-black tracking-tight">${tr('signedIn')}</h1>
          <p className="mt-3 text-sm text-[hsl(var(--foreground))/0.68]">${tr('loggedInAs')} ${state.user.name} (${state.user.email})</p>
          <div className="mt-6 rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-sm leading-6 text-[hsl(var(--foreground))/0.76]">${isAdmin ? tr('adminAccessInfo') : tr('customerInfo')}</div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#/" className="rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white">${tr('goHome')}</a>
            ${isAdmin ? html`<a href="#/admin" className="rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-semibold">${tr('adminDashboard')}</a>` : null}
            <button disabled=${loading} onClick=${logout} className="rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-semibold disabled:opacity-60">${loading ? tr('pleaseWait') : tr('logout')}</button>
          </div>
        </div>
      </div>
    `;
  }

  return html`
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg lg:grid-cols-2">
        <div className="hero-mesh p-8 lg:p-10">
          <div className="inline-flex rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 text-sm font-semibold text-[hsl(var(--primary))]">${tr('yuyuAccount')}</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight">${tr('authTitle')}</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[hsl(var(--foreground))/0.72]">${tr('authIntro')}</p>
        </div>
        <div className="p-8 lg:p-10">
          <div className="mb-6 flex rounded-[var(--radius-md)] bg-[hsl(var(--secondary))] p-1">
            <button type="button" disabled=${loading} onClick=${() => setMode('login')} className=${`flex-1 rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-[hsl(var(--card))] shadow-sm' : ''}`}>${tr('login')}</button>
            <button type="button" disabled=${loading} onClick=${() => setMode('signup')} className=${`flex-1 rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-[hsl(var(--card))] shadow-sm' : ''}`}>${tr('signup')}</button>
          </div>
          ${errors.form ? html`<div className="mb-4 rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-3 text-sm text-[hsl(var(--destructive))]">${errors.form}</div>` : null}
          ${message ? html`<div className="mb-4 rounded-[var(--radius-md)] bg-[hsl(var(--primary))/0.12] p-3 text-sm text-[hsl(var(--primary))]">${message}</div>` : null}
          <form onSubmit=${submit} className="space-y-4" noValidate>
            ${mode === 'signup' ? html`<label className="block"><span className="mb-2 block text-sm font-semibold">${tr('fullName')}</span><input disabled=${loading} value=${name} onInput=${(e) => setName(e.target.value)} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" />${errors.name ? html`<span className="mt-1 block text-xs text-[hsl(var(--destructive))]">${errors.name}</span>` : null}</label>` : null}
            <label className="block"><span className="mb-2 block text-sm font-semibold">${tr('emailAddress')}</span><input disabled=${loading} type="email" value=${email} onInput=${(e) => setEmail(e.target.value)} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" />${errors.email ? html`<span className="mt-1 block text-xs text-[hsl(var(--destructive))]">${errors.email}</span>` : null}</label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">${tr('password')}</span><div className="relative"><input disabled=${loading} value=${password} onInput=${(e) => setPassword(e.target.value)} type=${showPassword ? 'text' : 'password'} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 pr-12 text-sm outline-none disabled:opacity-60" /><button type="button" disabled=${loading} onClick=${() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[hsl(var(--foreground))/0.62] disabled:opacity-60" aria-label=${showPassword ? tr('hide') : tr('show')}>${showPassword ? html`<${EyeOff} className="h-4 w-4" />` : html`<${Eye} className="h-4 w-4" />`}</button></div>${errors.password ? html`<span className="mt-1 block text-xs text-[hsl(var(--destructive))]">${errors.password}</span>` : null}</label>
            <button disabled=${loading} className="w-full rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">${loading ? tr('pleaseWait') : mode === 'login' ? tr('login') : tr('createAccount')}</button>
          </form>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick=${googleLogin} disabled=${loading} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-semibold disabled:opacity-60">${tr('googleSignIn')}</button>
            <button type="button" onClick=${sendMagicLink} disabled=${loading} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-semibold disabled:opacity-60">${tr('magicLink')}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
