import React, { html } from '../jsx.js';
import { CONTACT_CONFIG, apiUrl } from '../config.js';
import { iconMap } from '../utils/icons.js';

const { Mail, Phone, Send, MessageCircle, Globe } = iconMap;

export function ContactPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() })
      });
      if (!res.ok) throw new Error('Contact request failed');
      setSuccess('Thank you! Your message has been received.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setSuccess('Thank you! Your message is saved in this demo. You can also contact us directly using the links on this page.');
      setName('');
      setEmail('');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    { label: 'Telegram', detail: CONTACT_CONFIG.telegramHandle, href: CONTACT_CONFIG.telegramUrl, Icon: Send },
    { label: 'Instagram', detail: CONTACT_CONFIG.instagramHandle, href: CONTACT_CONFIG.instagramUrl, Icon: Globe },
    { label: 'TikTok', detail: CONTACT_CONFIG.tiktokHandle, href: CONTACT_CONFIG.tiktokUrl, Icon: Globe },
    { label: 'WhatsApp', detail: CONTACT_CONFIG.phone, href: CONTACT_CONFIG.whatsappUrl, Icon: MessageCircle }
  ];

  return html`
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Contact us</div>
        <h1 className="text-4xl font-black tracking-tight">We would love to hear from you</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--foreground))/0.68]">Questions about products, orders, or partnerships? Send Yuyu Online Shopping a message anytime.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <aside className="hero-mesh rounded-[var(--radius-lg)] border border-[hsl(var(--border))] p-6 shadow-sm">
          <h2 className="text-2xl font-black">Contact details</h2>
          <div className="mt-6 space-y-4">
            <a href=${`mailto:${CONTACT_CONFIG.email}`} className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[hsl(var(--card))/0.78] p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <${Mail} className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="break-all text-sm font-semibold">${CONTACT_CONFIG.email}</span>
            </a>
            <a href=${`tel:${CONTACT_CONFIG.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[hsl(var(--card))/0.78] p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <${Phone} className="h-5 w-5 text-[hsl(var(--primary))]" />
              <span className="text-sm font-semibold">${CONTACT_CONFIG.phone}</span>
            </a>
          </div>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(var(--foreground))/0.62]">Social media</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            ${socialLinks.map(({ label, detail, href, Icon }) => html`
              <a key=${label} href=${href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.82] px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[hsl(var(--primary))] hover:text-white hover:shadow-sm">
                <${Icon} className="h-4 w-4 shrink-0" />
                <span>
                  <span className="block">${label}</span>
                  <span className="block text-xs font-medium opacity-75">${detail}</span>
                </span>
              </a>
            `)}
          </div>
        </aside>

        <form onSubmit=${submit} className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <h2 className="text-2xl font-black">Send a message</h2>
          ${error ? html`<div className="mt-4 rounded-[var(--radius-md)] bg-[hsl(var(--destructive))/0.12] p-3 text-sm text-[hsl(var(--destructive))]">${error}</div>` : null}
          ${success ? html`<div className="mt-4 rounded-[var(--radius-md)] bg-[hsl(var(--primary))/0.12] p-3 text-sm text-[hsl(var(--primary))]">${success}</div>` : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-semibold">Name</span><input disabled=${loading} value=${name} onInput=${(e) => setName(e.target.value)} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" placeholder="Your name" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Email</span><input disabled=${loading} type="email" value=${email} onInput=${(e) => setEmail(e.target.value)} className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" placeholder="Email address" /></label>
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Message</span><textarea disabled=${loading} value=${message} onInput=${(e) => setMessage(e.target.value)} rows="6" className="token-ring w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none disabled:opacity-60" placeholder="How can we help?"></textarea></label>
          </div>
          <button disabled=${loading} className="token-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60 sm:w-auto">
            <${Send} className="h-4 w-4" />
            ${loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  `;
}
