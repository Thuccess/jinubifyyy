'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { clientAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useIdentityAccess } from '@/components/identity/useIdentityAccess';
import { glassCard } from '@/components/identity/identityStyles';

export default function SettingsPage() {
  const { currentUser, refreshUser } = useAuth();
  const { isApproved, isPending, isRejected, status } = useIdentityAccess();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setEmail(currentUser?.email || '');
  }, [currentUser?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      setMessage('Account email and password can be updated after your application is approved.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await clientAPI.updateProfile({
        email: email.trim(),
        password: password || undefined,
      });
      await refreshUser();
      setMessage('Account updated.');
      setPassword('');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setMessage(msg || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Account security and approval status.</p>
      </div>

      {isPending ? (
        <div className={`${glassCard} border-amber-400/25 px-4 py-3 text-sm text-text-primary`} role="status">
          Your account is under review. We&apos;ll notify you soon.
        </div>
      ) : null}

      {isRejected ? (
        <div className={`${glassCard} border-rose-400/30 px-4 py-3 text-sm text-rose-950 dark:text-rose-100`} role="alert">
          <p className="font-semibold">Your application was not approved.</p>
          {currentUser?.rejectionReason ? (
            <p className="mt-2 text-text-secondary dark:text-rose-100/90">{currentUser.rejectionReason}</p>
          ) : null}
        </div>
      ) : null}

      {isApproved ? (
        <div className={`${glassCard} p-4 sm:p-6`}>
          <h2 className="text-sm font-bold text-text-primary">Account</h2>
          <p className="mt-1 text-xs text-text-muted">Email and password for signing in.</p>
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
                className="mt-2 w-full rounded-xl border border-border-card bg-bg-secondary px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save account'}
            </button>
          </form>
        </div>
      ) : (
        <div className={`${glassCard} p-4 sm:p-6 text-sm text-text-secondary`}>
          <p>
            Email and password updates are available when your account is approved. You can still build your public
            profile under{' '}
            <Link href="/dashboard/profile" className="font-semibold text-brand-primary">
              My Profile
            </Link>
            .
          </p>
        </div>
      )}

      {message ? <p className="text-sm text-brand-primary">{message}</p> : null}

      {isApproved ? (
        <p className="text-center text-xs text-text-muted">
          Status: <span className="font-semibold capitalize text-text-primary">{status}</span>
        </p>
      ) : null}
    </div>
  );
}
