'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, storeAuth, clearAuth } from '../../services/api';
import type { User } from '../../types';

const normalizeUserWithRole = (raw: User): User => {
  const r = raw.role && String(raw.role).toLowerCase();
  const role = r === 'admin' || r === 'super_admin' ? 'admin' : 'user';
  return {
    _id: raw._id,
    name: raw.name,
    email: raw.email,
    photoURL: raw.photoURL ?? '',
    role,
    balance: raw.balance,
  };
};

const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, login: setCurrentUser } = useAuth();
  const next = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      router.replace(next);
    }
  }, [currentUser?.role, next, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  if (currentUser?.role === 'admin') {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-sm text-text-secondary">Redirecting...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      const normalizedUser = normalizeUserWithRole(response.user as User);
      storeAuth(response.token, normalizedUser, rememberMe);
      setCurrentUser(normalizedUser);

      if (normalizedUser.role !== 'admin') {
        clearAuth();
        setCurrentUser(null);
        setError('This account does not have admin access.');
        setLoading(false);
        return;
      }

      router.push(next);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string; errors?: Array<{ msg?: string; message?: string }> } } };
      const backendMessage =
        ax.response?.data?.errors?.[0]?.message ||
        ax.response?.data?.errors?.[0]?.msg ||
        ax.response?.data?.message ||
        (ax.response?.status === 403
          ? 'Your account cannot access the admin area. It may be pending approval.'
          : 'Sign in failed. Please check your email and password.');
      const normalizedMessage =
        backendMessage === 'Invalid credentials'
          ? 'Invalid email or password'
          :
        backendMessage === 'Your account is pending approval'
          ? 'Verified. Waiting for admin approval.'
          : backendMessage;
      setError(normalizedMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Enter your email first, then resend verification.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    setError('');
    try {
      const res = await authAPI.resendVerification(targetEmail);
      setResendMessage(res.message || 'Verification email sent');
      setResendCooldown(60);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Array<{ msg?: string; message?: string }> } } };
      setError(
        ax.response?.data?.errors?.[0]?.message ||
          ax.response?.data?.errors?.[0]?.msg ||
          ax.response?.data?.message ||
          'Failed to resend verification email.',
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 shadow-sm sm:p-8 surface surface--modal">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Admin area
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              Admin sign in
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Sign in with an account that has admin access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setResendMessage('');
                }}
                required
                className="block w-full px-4 py-2 border border-border-subtle rounded-lg shadow-sm bg-bg-primary dark:bg-bg-primary text-text-primary focus:ring-brand-ring focus:border-border-accent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  setResendMessage('');
                }}
                required
                minLength={6}
                className="block w-full px-4 py-2 border border-border-subtle rounded-lg shadow-sm bg-bg-primary dark:bg-bg-primary text-text-primary focus:ring-brand-ring focus:border-border-accent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="admin-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-primary focus:ring-brand-ring border-border-subtle rounded"
              />
              <label
                htmlFor="admin-remember"
                className="ml-2 block text-sm text-text-primary"
              >
                Remember me
              </label>
            </div>

            {error && (
              <div
                className="p-3 bg-surface-muted border border-border-strong rounded-lg"
                role="alert"
              >
                <p className="text-sm text-text-primary">{error}</p>
              </div>
            )}
            {error === 'Please verify your email before logging in' && (
              <button
                type="button"
                disabled={resendLoading || resendCooldown > 0}
                onClick={handleResendVerification}
                className="w-full flex justify-center py-2 px-4 rounded-lg border border-border-subtle text-sm font-medium text-text-primary hover:bg-surface-muted/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-ring disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {resendLoading
                  ? 'Sending...'
                  : resendCooldown > 0
                    ? `Resend Verification Email (${resendCooldown}s)`
                    : 'Resend Verification Email'}
              </button>
            )}
            {resendMessage && (
              <div className="p-3 bg-surface-muted border border-border-subtle rounded-lg">
                <p className="text-sm text-text-primary">{resendMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 rounded-lg shadow-sm text-sm font-medium text-text-inverted bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-ring disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing in...' : 'Sign in to admin'}
            </button>
          </form>

          <p className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-brand-primary hover:text-text-primary hover:bg-surface-muted/90 py-1 px-2 rounded-lg transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
            >
              Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
