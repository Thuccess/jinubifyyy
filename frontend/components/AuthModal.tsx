'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';
import { authAPI, storeAuth } from '../services/api';
import { User } from '../types';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-[color:var(--surface-card)] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)] focus:border-[color:var(--border-accent)] transition-colors duration-200';
const labelClass = 'block text-sm font-medium text-text-primary mb-1';
const oauthBtnClass =
  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border-subtle bg-[color:var(--surface-muted)] text-text-primary hover:bg-[color:var(--surface-card)] text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'signIn' | 'signUp';
  onSuccess: (user: User) => void;
}

const STEPS = [
  { id: 1, label: 'Sign up your account' },
  { id: 2, label: 'Set up your workspace' },
  { id: 3, label: 'Set up your profile' },
] as const;

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, view: initialView, onSuccess }) => {
  const [view, setView] = useState<'signIn' | 'signUp'>(initialView);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    workspaceName: '',
    photoURL: '',
    phone: '',
    company: '',
    website: '',
  });

  useEffect(() => {
    setView(initialView);
    setStep(1);
    setError('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      workspaceName: '',
      photoURL: '',
      phone: '',
      company: '',
      website: '',
    });
  }, [initialView, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    setError('');
    // Ready for integration: set your backend OAuth URLs or use Next.js Auth
    const base = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)?.replace(/\/api\/?$/, '') || '';
    const url = base ? `${base}/api/auth/${provider}` : '';
    if (url) {
      window.location.href = url;
    } else {
      setError(`${provider === 'google' ? 'Google' : 'GitHub'} sign-in: connect your OAuth endpoint in AuthModal handleOAuth.`);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      const loginRole = response.user.role && String(response.user.role).toLowerCase() === 'admin' ? 'admin' : 'user';
      const normalizedUser = {
        _id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        photoURL: response.user.photoURL,
        role: loginRole,
        balance: response.user.balance,
      };
      storeAuth(response.token, normalizedUser as User, rememberMe);
      onSuccess(normalizedUser as User);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          'Failed to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      // Before moving to final step, ensure core account fields are filled
      if (!formData.firstName.trim() && !formData.lastName.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Please fill in your email and password.');
        return;
      }
      setStep((s) => s + 1);
      setError('');
      return;
    }
    // Final step: require company, phone, photo
    if (!formData.company.trim() || !formData.phone.trim() || !formData.photoURL.trim()) {
      setError('Company, phone number, and profile photo are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const name = [formData.firstName, formData.lastName].filter(Boolean).join(' ') || formData.email;
      const response = await authAPI.register({
        name,
        email: formData.email,
        password: formData.password,
        photoURL: formData.photoURL,
        phone: formData.phone,
        company: formData.company,
        website: formData.website || undefined,
      });
      setError(response.message || 'Your account has been submitted for approval. You will be able to log in once the admin approves your request.');
      setView('signIn');
      setStep(1);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.[0]?.msg ||
          'Failed to sign up. Please try again.'
      );
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
              <Dialog.Panel className="w-full max-w-2xl overflow-hidden surface surface--modal border border-border-subtle transition-colors duration-300">
                <div className="flex flex-col md:flex-row min-h-[520px] md:min-h-[560px]">
                  {/* Left: steps panel (hidden on small mobile when sign-in) */}
                  <div
                    className={`bg-[color:var(--bg-secondary)] p-6 md:p-8 md:w-[42%] flex flex-col justify-center border-b md:border-b-0 md:border-r border-border-subtle transition-colors duration-300 ${
                      view === 'signIn' ? 'hidden md:flex' : 'flex'
                    }`}
                  >
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                      Get Started with Us
                    </h2>
                    <p className="text-text-secondary text-sm md:text-base mb-8">
                      Complete these easy steps to register your account.
                    </p>
                    <div className="space-y-3">
                      {STEPS.map((s) => {
                        const active = view === 'signUp' && step === s.id;
                        return (
                          <div
                            key={s.id}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 ${
                              active
                                ? 'bg-[color:var(--surface-card)] border border-border-subtle text-text-primary'
                                : 'bg-[color:var(--surface-muted)] text-text-secondary'
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                active ? 'bg-[color:var(--surface-muted)] text-text-primary' : 'bg-[color:var(--border-subtle)] text-text-muted'
                              }`}
                            >
                              {s.id}
                            </span>
                            <span className="text-sm font-medium">{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: form */}
                  <div className="flex-1 flex flex-col p-6 md:p-8 bg-[color:var(--bg-primary)] transition-colors duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <Dialog.Title as="h3" className="text-xl md:text-2xl font-bold text-text-primary">
                          {view === 'signIn' ? 'Sign In' : step === 1 ? 'Sign Up Account' : step === 2 ? 'Set Up Workspace' : 'Set Up Profile'}
                  </Dialog.Title>
                        <p className="mt-1 text-sm text-text-secondary">
                          {view === 'signIn'
                            ? 'Enter your credentials to access your account.'
                            : step === 1
                              ? 'Enter your personal data to create your account.'
                              : step === 2
                                ? 'Name your workspace (optional).'
                                : 'Add your company details, phone, and profile photo.'}
                        </p>
                      </div>
                  <button
                    onClick={onClose}
                        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                    {view === 'signIn' ? (
                      <form onSubmit={handleSignIn} className="flex flex-col gap-4 flex-1">
                        <div className="flex gap-3">
                          <button type="button" onClick={() => handleOAuth('google')} className={oauthBtnClass}>
                            <span className="font-semibold">G</span> Google
                          </button>
                          <button type="button" onClick={() => handleOAuth('github')} className={oauthBtnClass}>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 2.24-1.296 2.75-1.026 2.75-1.026.544 1.379.202 2.397.098 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            Github
                          </button>
                    </div>
                        <p className="text-center text-xs text-text-muted">Or</p>
                  <div>
                          <label htmlFor="email" className={labelClass}>Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                            className={inputClass}
                            placeholder="eg. john@example.com"
                    />
                  </div>
                  <div>
                          <label htmlFor="password" className={labelClass}>Password</label>
                          <div className="relative">
                    <input
                              type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                              className={`${inputClass} pr-10`}
                              placeholder="Enter your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-text-muted hover:text-text-primary transition-colors"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                  </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-border-subtle text-[color:var(--accent-primary)] focus:ring-[color:var(--accent-ring)]"
                          />
                          <label htmlFor="remember-me" className="ml-2 text-sm text-text-secondary">Remember me</label>
                        </div>
                        {error && (
                          <div className="p-3 rounded-lg text-sm bg-[color:var(--surface-muted)] border border-border-strong text-text-primary">
                            {error}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 rounded-xl font-semibold btn-primary disabled:opacity-60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                        >
                          {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <p className="text-center text-sm text-text-secondary">
                          Don&apos;t have an account?{' '}
                          <button
                            type="button"
                            onClick={() => { setView('signUp'); setError(''); }}
                            className="font-medium text-text-primary hover:underline"
                          >
                            Sign Up
                          </button>
                        </p>
                      </form>
                    ) : (
                      <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4 flex-1">
                        {step === 1 && (
                          <>
                            <div className="flex gap-3">
                              <button type="button" onClick={() => handleOAuth('google')} className={oauthBtnClass}>
                                <span className="font-semibold">G</span> Google
                              </button>
                              <button type="button" onClick={() => handleOAuth('github')} className={oauthBtnClass}>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 2.24-1.296 2.75-1.026 2.75-1.026.544 1.379.202 2.397.098 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                Github
                              </button>
                            </div>
                            <p className="text-center text-xs text-text-muted">Or</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label htmlFor="firstName" className={labelClass}>First Name</label>
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className={inputClass} placeholder="eg. John" />
                              </div>
                              <div>
                                <label htmlFor="lastName" className={labelClass}>Last Name</label>
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className={inputClass} placeholder="eg. Francisco" />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="email" className={labelClass}>Email</label>
                              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClass} placeholder="eg. johnfrans@gmail.com" />
                            </div>
                            <div>
                              <label htmlFor="password" className={labelClass}>Password</label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  id="password"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  required
                                  minLength={8}
                                  className={`${inputClass} pr-10`}
                                  placeholder="Enter your password"
                                />
                                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-text-muted hover:text-text-primary transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                              </div>
                              <p className="mt-1 text-xs text-text-muted">Must be at least 8 characters.</p>
                            </div>
                          </>
                        )}
                        {step === 2 && (
                          <div>
                            <label htmlFor="workspaceName" className={labelClass}>Workspace name</label>
                            <input type="text" id="workspaceName" name="workspaceName" value={formData.workspaceName} onChange={handleInputChange} className={inputClass} placeholder="eg. My Company" />
                          </div>
                        )}
                        {step === 3 && (
                          <>
                            <div>
                              <label htmlFor="company" className={labelClass}>Company name</label>
                              <input
                                type="text"
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                className={inputClass}
                                placeholder="eg. Jinubify Ltd."
                              />
                            </div>
                            <div>
                              <label htmlFor="phone" className={labelClass}>Phone number</label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={inputClass}
                                placeholder="eg. +256 700 000000"
                              />
                            </div>
                            <div>
                              <label htmlFor="photoURL" className={labelClass}>Profile photo URL</label>
                              <input
                                type="url"
                                id="photoURL"
                                name="photoURL"
                                value={formData.photoURL}
                                onChange={handleInputChange}
                                className={inputClass}
                                placeholder="https://example.com/photo.jpg"
                              />
                            </div>
                            <div>
                              <label htmlFor="website" className={labelClass}>Website URL (optional)</label>
                              <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className={inputClass}
                                placeholder="https://yourcompany.com"
                              />
                            </div>
                          </>
                        )}

                  {error && (
                          <div className="p-3 rounded-lg text-sm bg-[color:var(--surface-muted)] border border-border-strong text-text-primary">
                            {error}
                    </div>
                  )}

                        <div className="flex gap-3 mt-auto pt-4">
                          {step > 1 && (
                            <button
                              type="button"
                              onClick={() => { setStep((s) => s - 1); setError(''); }}
                              className="flex-1 py-3 rounded-xl font-medium border border-border-subtle text-text-secondary hover:bg-surface-muted transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                            >
                              Back
                            </button>
                          )}
                  <button
                    type="submit"
                    disabled={loading}
                            className="flex-1 py-3 rounded-xl font-semibold btn-primary disabled:opacity-60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                  >
                            {loading ? 'Processing...' : step < 3 ? 'Next' : 'Sign Up'}
                  </button>
                        </div>
                </form>
                    )}

                    {view === 'signUp' && (
                      <p className="mt-4 text-center text-sm text-text-secondary">
                        Already have an account?{' '}
                        <button type="button" onClick={() => { setView('signIn'); setError(''); setStep(1); }} className="font-medium text-text-primary hover:underline">
                          Log In
                  </button>
                      </p>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthModal;
