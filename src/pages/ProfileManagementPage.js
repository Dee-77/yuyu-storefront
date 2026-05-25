import React, { html } from '../jsx.js';
import { useStore } from '../store/store.js';
import { useToast } from '../store/toast.js';
import { iconMap } from '../utils/icons.js';

const { UserCircle2, Save, KeyRound } = iconMap;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export function ProfileManagementPage() {
  const { state, dispatch, isAdmin } = useStore();
  const { pushToast } = useToast();
  const [profileForm, setProfileForm] = React.useState(() => state.ownerProfile || {});
  const [profileError, setProfileError] = React.useState('');
  const [profileSuccess, setProfileSuccess] = React.useState('');
  const [logoLoading, setLogoLoading] = React.useState(false);
  const [logoError, setLogoError] = React.useState('');
  const [verificationSent, setVerificationSent] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState('');
  const [passwordForm, setPasswordForm] = React.useState({ current: '', next: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState('');
  const logoInputRef = React.useRef(null);

  React.useEffect(() => { setProfileForm(state.ownerProfile || {}); }, [state.ownerProfile]);
  const authHeaders = () => state.user?.token ? { Authorization: `Bearer ${state.user.token}` } : {};

  const handleLogoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoError('');
    if (!file.type.startsWith('image/')) { setLogoError('Please choose an image file for the logo.'); event.target.value = ''; return; }
    if (file.size > 1024 * 1024) { setLogoError('Logo image must be 1MB or smaller.'); event.target.value = ''; return; }
    setLogoLoading(true);
    try {
      const logo = await readImageFile(file);
      dispatch({ type: 'SET_BRANDING_LOGO', logo });
      pushToast({ title: 'Logo updated', description: 'Website logo was replaced.' });
    } catch (err) {
      setLogoError(err.message || 'Could not upload logo. Please try another image.');
    } finally {
      setLogoLoading(false);
      event.target.value = '';
    }
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!profileForm.name?.trim() || !profileForm.email?.trim()) return setProfileError('Owner name and email are required.');
    if (!EMAIL_RE.test(profileForm.email.trim())) return setProfileError('Enter a valid owner email address.');
    dispatch({ type: 'SET_OWNER_PROFILE', profile: { name: profileForm.name.trim(), email: profileForm.email.trim(), phone: (profileForm.phone || '').trim(), businessName: (profileForm.businessName || '').trim(), address: (profileForm.address || '').trim() } });
    setProfileSuccess('Owner profile details saved.');
    pushToast({ title: 'Profile saved', description: profileForm.name.trim() });
  };

  const sendVerification = async () => {
    setVerifyError('');
    const email = (profileForm.email || state.ownerProfile?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return setVerifyError('Save a valid owner email before requesting verification.');
    setVerifyLoading(true);
    try {
      if (!window.genmb?.auth) throw new Error('Email verification service is unavailable.');
      await window.genmb.auth.ready();
      await window.genmb.auth.sendMagicLink(email);
      setVerificationSent(true);
      pushToast({ title: 'Verification sent', description: 'Check the owner email for the secure link.' });
    } catch (err) {
      setVerifyError(err.message || 'Could not send verification email.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const confirmVerification = async () => {
    setVerifyError('');
    setVerifyLoading(true);
    try {
      if (!window.genmb?.auth) throw new Error('Email verification service is unavailable.');
      await window.genmb.auth.ready();
      const user = window.genmb.auth.getUser();
      const ownerEmail = (profileForm.email || state.ownerProfile?.email || '').trim().toLowerCase();
      if (!user || (user.email || '').toLowerCase() !== ownerEmail) throw new Error('Open the verification link from the registered owner email, then click Confirm verification.');
      setVerified(true);
      pushToast({ title: 'Email verified', description: 'Password change is now unlocked.' });
    } catch (err) {
      setVerifyError(err.message || 'Verification failed.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!verified) return setPasswordError('Verify the registered owner email before changing the password.');
    const current = passwordForm.current.trim(), next = passwordForm.next.trim(), confirm = passwordForm.confirm.trim();
    if (!current || !next || !confirm) return setPasswordError('Please fill in current password, new password, and confirmation.');
    if (next.length < 6) return setPasswordError('New password must be at least 6 characters.');
    if (next !== confirm) return setPasswordError('New password and confirmation do not match.');
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ current_password: current, new_password: next }) });
      if (!res.ok) throw new Error('Could not change password. Please check your current password and backend connection.');
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordSuccess('Admin password changed successfully.');
      pushToast({ title: 'Password changed', description: 'Admin login password was updated.' });
    } catch (err) {
      setPasswordError(err.message || 'Could not change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isAdmin) return html`<div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8"><div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center shadow-sm"><h1 className="text-3xl font-black tracking-tight">Profile management</h1><p className="mt-3 text-sm text-[hsl(var(--foreground))/0.68]">You must be logged in as an admin to manage branding, owner profile, and password settings.</p><a href="#/auth" className="mt-6 inline-block rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white">Go to login</a></div></div>`;

  return html`<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))/0.12] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary))]"><${UserCircle2} className="h-4 w-4" />Profile</div><h1 className="text-3xl font-black tracking-tight">Profile Management</h1><p className="mt-2 text-sm text-[hsl(var(--foreground))/0.68]">Manage website branding, owner contact details, and secure password updates.</p></div><a href="#/admin" className="text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-80">Back to dashboard</a></div>

    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <section className="h-fit rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"><h2 className="text-lg font-bold">Website logo</h2><div className="mt-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[hsl(var(--primary))] text-white shadow-sm">${state.brandingLogo ? html`<img src=${state.brandingLogo} alt="Current logo" className="h-full w-full object-cover" />` : html`<span className="text-4xl font-black">Y</span>`}</div><button type="button" disabled=${logoLoading} onClick=${() => logoInputRef.current?.click()} className="token-ring mt-4 w-full rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">${logoLoading ? 'Uploading...' : state.brandingLogo ? 'Replace logo' : 'Upload logo'}</button><input ref=${logoInputRef} type="file" accept="image/*" disabled=${logoLoading} onChange=${handleLogoSelect} className="sr-only" />${state.brandingLogo ? html`<button type="button" disabled=${logoLoading} onClick=${() => { dispatch({ type: 'SET_BRANDING_LOGO', logo: '' }); pushToast({ title: 'Logo removed', description: 'Default logo restored.' }); }} className="token-ring mt-2 w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold text-[hsl(var(--destructive))] disabled:opacity-60">Remove logo</button>` : null}${logoError ? html`<div className="mt-3 rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-2 text-xs text-[hsl(var(--destructive))]">${logoError}</div>` : null}<p className="mt-3 text-xs leading-5 text-[hsl(var(--foreground))/0.58]">PNG/JPG/WebP, 1MB or smaller. Updates the navbar and footer instantly.</p></section>

      <section className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"><h2 className="text-lg font-bold">Owner profile details</h2><form onSubmit=${saveProfile} className="mt-4 grid gap-3 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground))/0.52]">Owner name</span><input value=${profileForm.name || ''} onInput=${(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none" /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground))/0.52]">Email</span><input type="email" value=${profileForm.email || ''} onInput=${(e) => { setVerified(false); setProfileForm((f) => ({ ...f, email: e.target.value })); }} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none" /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground))/0.52]">Phone</span><input type="tel" value=${profileForm.phone || ''} onInput=${(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none" /></label><label><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground))/0.52]">Business name</span><input value=${profileForm.businessName || ''} onInput=${(e) => setProfileForm((f) => ({ ...f, businessName: e.target.value }))} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none" /></label><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground))/0.52]">Contact address / notes</span><textarea rows="3" value=${profileForm.address || ''} onInput=${(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none"></textarea></label>${profileError ? html`<div className="sm:col-span-2 rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-3 text-sm text-[hsl(var(--destructive))]">${profileError}</div>` : null}${profileSuccess ? html`<div className="sm:col-span-2 rounded-[var(--radius-md)] bg-[hsl(var(--primary))/0.12] p-3 text-sm text-[hsl(var(--primary))]">${profileSuccess}</div>` : null}<button className="token-ring sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[hsl(var(--foreground))] px-4 py-2.5 text-sm font-semibold text-white"><${Save} className="h-4 w-4" />Save profile</button></form></section>
    </div>

    <section className="mt-6 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))]"><${KeyRound} className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">Secure password change</h2><p className="text-sm text-[hsl(var(--foreground))/0.66]">Verify the registered owner email before updating the encrypted backend admin password.</p></div></div><div className="mb-4 grid gap-3 rounded-[var(--radius-md)] bg-[hsl(var(--secondary))] p-4 sm:grid-cols-[1fr,auto,auto]"><div className="text-sm"><div className="font-semibold">Owner email verification</div><div className="mt-1 text-[hsl(var(--foreground))/0.66]">${verified ? 'Verified. Password change is unlocked.' : verificationSent ? 'Verification link sent. Open it from the owner email, then confirm.' : 'Send a secure verification link to the registered owner email.'}</div></div><button type="button" disabled=${verifyLoading} onClick=${sendVerification} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-semibold disabled:opacity-60">${verifyLoading ? 'Please wait...' : 'Send verification link'}</button><button type="button" disabled=${verifyLoading} onClick=${confirmVerification} className="token-ring rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Confirm verification</button></div>${verifyError ? html`<div className="mb-4 rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-3 text-sm text-[hsl(var(--destructive))]">${verifyError}</div>` : null}${passwordError ? html`<div className="mb-4 rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-3 text-sm text-[hsl(var(--destructive))]">${passwordError}</div>` : null}${passwordSuccess ? html`<div className="mb-4 rounded-[var(--radius-md)] bg-[hsl(var(--primary))/0.12] p-3 text-sm text-[hsl(var(--primary))]">${passwordSuccess}</div>` : null}<form onSubmit=${changePassword} className="grid gap-3 lg:grid-cols-[1fr,1fr,1fr,auto] lg:items-end"><input type="password" placeholder="Current password" value=${passwordForm.current} disabled=${passwordLoading || !verified} onInput=${(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none disabled:opacity-60" autocomplete="current-password" /><input type="password" placeholder="New password" value=${passwordForm.next} disabled=${passwordLoading || !verified} onInput=${(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none disabled:opacity-60" autocomplete="new-password" /><input type="password" placeholder="Confirm new password" value=${passwordForm.confirm} disabled=${passwordLoading || !verified} onInput=${(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} className="token-ring rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none disabled:opacity-60" autocomplete="new-password" /><button disabled=${passwordLoading || !verified} className="token-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><${Save} className="h-4 w-4" />${passwordLoading ? 'Updating...' : 'Update password'}</button></form></section>
  </div>`;
}
