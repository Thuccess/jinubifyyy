'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/admin/Modal';
import type { WebsiteDemo } from '@/types/websiteDemo';
import { contactAPI } from '@/services/api';

export interface GetThisWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  demo: WebsiteDemo | null;
}

function buildDefaultMessage(d: WebsiteDemo): string {
  const lines = [
    `I'd like to order this website template.`,
    ``,
    `Demo: ${d.title}`,
    `Reference slug: ${d.slug}`,
  ];
  if (d.demoUrl) lines.push(`Live preview: ${d.demoUrl}`);
  if (d.price != null && Number.isFinite(d.price)) lines.push(`Listed from: $${d.price.toLocaleString()}`);
  lines.push(``, `Please confirm availability, timeline, and customization options.`);
  return lines.join('\n');
}

const GetThisWebsiteModal: React.FC<GetThisWebsiteModalProps> = ({ open, onClose, demo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open && demo) {
      setMessage(buildDefaultMessage(demo));
      setError(null);
      setDone(false);
    }
  }, [open, demo]);

  if (!demo) return null;

  const subject = `Order website: ${demo.title} [${demo.slug}]`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    const em = email.trim();
    const msg = message.trim();
    if (!n || !em || !msg) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setSubmitting(true);
    try {
      const body = phone.trim()
        ? `${msg}\n\nPhone: ${phone.trim()}`
        : msg;
      await contactAPI.submitContact({
        name: n,
        email: em,
        subject,
        message: body,
      });
      setDone(true);
      setTimeout(() => {
        onClose();
        setDone(false);
        setName('');
        setEmail('');
        setPhone('');
      }, 1800);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again or use the contact page.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={demo.ctaSecondary || 'Get this website'}
      size="md"
    >
      {done ? (
        <p className="text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Thanks — we received your request. We&apos;ll get back to you shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Request a quote for this exact template:{' '}
            <span className="font-semibold text-text-primary">{demo.title}</span>
          </p>

          <div>
            <label htmlFor="order-name" className="mb-1 block text-sm font-medium text-text-primary">
              Name *
            </label>
            <input
              id="order-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              required
            />
          </div>
          <div>
            <label htmlFor="order-email" className="mb-1 block text-sm font-medium text-text-primary">
              Email *
            </label>
            <input
              id="order-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              required
            />
          </div>
          <div>
            <label htmlFor="order-phone" className="mb-1 block text-sm font-medium text-text-primary">
              Phone (optional)
            </label>
            <input
              id="order-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
            />
          </div>
          <div>
            <label htmlFor="order-message" className="mb-1 block text-sm font-medium text-text-primary">
              Message *
            </label>
            <textarea
              id="order-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-subtle bg-surface-muted px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-card"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverted hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Submit request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default GetThisWebsiteModal;
