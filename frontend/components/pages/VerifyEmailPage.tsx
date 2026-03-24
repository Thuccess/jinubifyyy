'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authAPI } from '../../services/api';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';

type VerifyState = 'loading' | 'success' | 'error';

const VerifyEmailPage: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('Verifying your email...');

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
        setMessage(res.message || 'Email verified successfully');
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

  return (
    <div className="animate-fade-in flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 shadow-sm sm:p-8 surface surface--modal">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted text-center">Account</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary text-center">Email verification</h1>

        <div className="mt-6">
          {state === 'loading' && (
            <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-muted)] px-4 py-4">
              <SkeletonBlock className="h-4 w-40" rounded="full" />
              <SkeletonBlock className="mt-3 h-3 w-56" rounded="full" />
              <p className="mt-3 text-sm text-text-primary">{message}</p>
            </div>
          )}

          {state === 'success' && (
            <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-muted)] px-4 py-4">
              <p className="text-sm font-medium text-text-primary">{message}</p>
            </div>
          )}

          {state === 'error' && (
            <div className="rounded-lg border border-border-strong bg-[color:var(--surface-muted)] px-4 py-4">
              <p className="text-sm font-medium text-text-primary">{message}</p>
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

