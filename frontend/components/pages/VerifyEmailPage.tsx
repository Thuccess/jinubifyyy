'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '../../services/api';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';

type VerifyState = 'loading' | 'success' | 'error';

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const redirectScheduled = useRef(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!token) {
        if (!active) return;
        setState('error');
        setMessage('Invalid or expired link');
        return;
      }

      try {
        const res = await authAPI.verifyEmail(token);
        if (!active) return;
        setState('success');
        setMessage('Email verified successfully');
        setVerifiedEmail((res.email && String(res.email).trim()) || '');
      } catch {
        if (!active) return;
        setState('error');
        setMessage('Invalid or expired link');
      }
    };

    verify();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (state !== 'success' || redirectScheduled.current) return;
    redirectScheduled.current = true;
    const t = window.setTimeout(() => {
      const e = verifiedEmail.trim();
      const q = e ? `auth=login&email=${encodeURIComponent(e)}` : 'auth=login';
      router.replace(`/?${q}`, { scroll: false });
    }, 1600);
    return () => window.clearTimeout(t);
  }, [state, verifiedEmail, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  const handleResend = async () => {
    const target = email.trim();
    if (!target) {
      setResendMessage('');
      setMessage('Please enter your email to resend verification.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    try {
      const res = await authAPI.resendVerification(target);
      setResendMessage(res.message || 'Verification email sent. Check your inbox.');
      setResendCooldown(60);
    } catch (err: any) {
      const backendMessage =
        (typeof err?.response?.data?.message === 'string' && err.response.data.message) ||
        'Something went wrong';
      setResendMessage('');
      setMessage(backendMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card sm:p-8 surface surface--modal">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted text-center">Account</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary text-center">Email verification</h1>

        <div className="mt-6">
          {state === 'loading' && (
            <div className="rounded-lg border border-border-card bg-[color:var(--surface-muted)] px-4 py-4">
              <SkeletonBlock className="h-4 w-40" rounded="full" />
              <SkeletonBlock className="mt-3 h-3 w-56" rounded="full" />
              <p className="mt-3 text-sm text-text-primary">{message}</p>
            </div>
          )}

          {state === 'success' && (
            <div className="rounded-lg border border-border-card bg-[color:var(--surface-muted)] px-4 py-4">
              <p className="text-sm font-medium text-text-primary">{message}</p>
            </div>
          )}

          {state === 'error' && (
            <div className="rounded-lg border border-border-strong bg-[color:var(--surface-muted)] px-4 py-4">
              <p className="text-sm font-medium text-text-primary">{message}</p>

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="verify-email" className="block text-sm font-medium text-text-secondary mb-1">
                    Email
                  </label>
                  <input
                    id="verify-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2 border border-border-subtle rounded-lg shadow-sm bg-bg-primary text-text-primary focus:ring-brand-ring focus:border-border-accent"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full flex justify-center py-2.5 px-4 rounded-lg border border-border-subtle text-sm font-semibold text-text-primary hover:bg-surface-muted/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-ring disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {resendLoading
                    ? 'Sending...'
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Verification Email'}
                </button>

                {resendMessage && (
                  <div className="rounded-lg border border-border-card bg-[color:var(--surface-muted)] px-4 py-3">
                    <p className="text-sm text-text-primary">
                      {resendMessage === 'If an account exists, a verification email has been sent.'
                        ? 'Verification email sent. Check your inbox.'
                        : resendMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="flex-1 py-2.5 rounded-xl text-center font-semibold btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            Go Home
          </Link>
          <Link
            href="/admin/login"
            className="flex-1 py-2.5 rounded-xl text-center font-semibold btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

