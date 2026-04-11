'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';
import PublicSignUpSteps from './onboarding/PublicSignUpSteps';
import { authAPI, storeAuth } from '../services/api';
import { User } from '../types';

const inputClass =
  'w-full h-11 px-4 rounded-xl border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-[color:var(--border-accent)]';
const labelClass = 'block text-sm font-medium text-text-primary mb-1.5';

const getApiErrorMessage = (err: unknown) => {
  const e = err as { response?: { data?: { message?: string } } };
  return (typeof e?.response?.data?.message === 'string' && e.response.data.message) || 'Something went wrong';
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'signIn' | 'signUp';
  onSuccess: (user: User) => void;
  /** Prefills sign-in email (e.g. after email verification deep link). */
  signInPrefillEmail?: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, view: initialView, onSuccess, signInPrefillEmail }) => {
  const [view, setView] = useState<'signIn' | 'signUp'>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    setView(initialView);
    setError('');
    setSuccessMessage('');
    setVerificationEmail('');
    setResendMessage('');
    setResendCooldown(0);
    const prefill = (signInPrefillEmail || '').trim();
    setFormData({
      email: initialView === 'signIn' && prefill ? prefill : '',
      password: '',
    });
  }, [initialView, isOpen, signInPrefillEmail]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setResendMessage('');
  };

  const handleResendVerification = async (emailOverride?: string) => {
    const email = (emailOverride || verificationEmail || formData.email || '').trim();
    if (!email) {
      setError('Please provide your email to resend verification.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    setError('');
    try {
      const res = await authAPI.resendVerification(email);
      setResendMessage(res.message || 'Verification email sent');
      setVerificationEmail(email);
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setResendMessage('');
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      const loginRole = response.user.role && String(response.user.role).toLowerCase() === 'admin' ? 'admin' : 'user';
      const normalizedUser = {
        ...response.user,
        role: loginRole,
      } as User;
      storeAuth(response.token, normalizedUser, rememberMe);
      onSuccess(normalizedUser);
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; rejectionReason?: string } } };
      const backendMessage = getApiErrorMessage(err);
      let normalizedMessage = backendMessage;
      if (backendMessage === 'Your application was not approved') {
        const reason = e?.response?.data?.rejectionReason;
        normalizedMessage = reason
          ? `${backendMessage} Reason: ${reason}`
          : `${backendMessage} Contact support if you have questions.`;
      }
      setError(normalizedMessage);
      if (backendMessage === 'Please activate your account via email') {
        setVerificationEmail(formData.email.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 transition-opacity duration-300" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md mx-auto md:max-w-4xl md:mx-0 overflow-hidden surface surface--modal border border-border-card rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 transition-colors duration-300">
                {view === 'signUp' ? (
                  <PublicSignUpSteps
                    key={isOpen ? 'signup-open' : 'signup-closed'}
                    inputClass={inputClass}
                    labelClass={labelClass}
                    onClose={onClose}
                    onComplete={(email) => {
                      setVerificationEmail(email);
                      setSuccessMessage(
                        'Almost there — check your email to activate your Jinubify profile.\n\nYour account has been created successfully. Please check your email and click the verification link to activate your profile.',
                      );
                      setView('signIn');
                    }}
                    onSwitchToSignIn={() => {
                      setView('signIn');
                      setError('');
                    }}
                  />
                ) : (
                  <div className="flex flex-col md:flex-row min-h-[520px] md:min-h-[560px]">
                    <div className="hidden md:flex md:w-[44%] flex-col justify-between p-8 md:p-10 border-b md:border-b-0 md:border-r border-border-subtle bg-gradient-to-br from-brand-soft/25 via-[color:var(--bg-secondary)] to-[color:var(--surface-muted)] transition-colors duration-300">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Jinubify</p>
                        <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Welcome back</h2>
                        <p className="mt-2 text-sm md:text-base text-text-secondary leading-relaxed max-w-xs">
                          Sign in to manage your profile, connect with others, and keep building.
                        </p>
                      </div>
                      <p className="text-xs text-text-muted">Secure sign-in · Encrypted session</p>
                    </div>

                    <div className="flex-1 flex flex-col p-6 md:p-8 bg-[color:var(--bg-primary)] transition-colors duration-300 md:max-w-none">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <Dialog.Title as="h3" className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                            Welcome back 👋
                          </Dialog.Title>
                          <p className="mt-1.5 text-sm text-text-secondary">Sign in to continue to Jinubify</p>
                        </div>
                        <button
                          type="button"
                          onClick={onClose}
                          className="shrink-0 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                          aria-label="Close"
                        >
                          <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                      </div>

                      <form onSubmit={handleSignIn} className="flex flex-col flex-1 mt-6">
                        <div className="space-y-4 flex-1 flex flex-col">
                          <div>
                            <label htmlFor="email" className={labelClass}>
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className={inputClass}
                              placeholder="you@company.com"
                              autoComplete="email"
                            />
                          </div>
                          <div>
                            <label htmlFor="password" className={labelClass}>
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                                className={`${inputClass} pr-11`}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted/80 transition-all duration-200"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 gap-y-2">
                            <div className="flex items-center min-h-[44px]">
                              <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-border-subtle text-[color:var(--accent-primary)] focus:ring-2 focus:ring-[color:var(--accent-ring)]"
                              />
                              <label htmlFor="remember-me" className="ml-2 text-sm text-text-secondary cursor-pointer">
                                Remember me
                              </label>
                            </div>
                            <a
                              href="mailto:support@jinubify.com?subject=Password%20help"
                              className="text-sm font-medium text-text-primary hover:underline underline-offset-2 transition-colors min-h-[44px] inline-flex items-center"
                            >
                              Forgot password?
                            </a>
                          </div>

                          {error && (
                            <div className="p-3 rounded-xl text-sm bg-[color:var(--surface-muted)] border border-border-strong text-text-primary">
                              {error}
                            </div>
                          )}
                          {successMessage && (
                            <div className="p-3 rounded-xl text-sm bg-[color:var(--surface-muted)] border border-border-card text-text-primary whitespace-pre-line">
                              {successMessage}
                            </div>
                          )}
                          {(successMessage || error === 'Please activate your account via email') && (
                            <button
                              type="button"
                              onClick={() => handleResendVerification()}
                              disabled={resendLoading || resendCooldown > 0}
                              className="w-full h-11 rounded-xl font-semibold btn-secondary disabled:opacity-60 transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                            >
                              {resendLoading
                                ? 'Sending...'
                                : resendCooldown > 0
                                  ? `Resend verification (${resendCooldown}s)`
                                  : 'Resend verification email'}
                            </button>
                          )}
                          {resendMessage && (
                            <div className="p-3 rounded-xl text-sm bg-[color:var(--surface-muted)] border border-border-card text-text-primary">
                              {resendMessage}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 mt-2 rounded-xl font-semibold btn-primary disabled:opacity-60 transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                          >
                            {loading ? 'Signing in...' : 'Sign in'}
                          </button>
                          <p className="text-center text-sm text-text-secondary pt-2">
                            Don&apos;t have an account?{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setView('signUp');
                                setError('');
                                setSuccessMessage('');
                              }}
                              className="font-semibold text-text-primary hover:underline underline-offset-2"
                            >
                              Sign up
                            </button>
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthModal;
