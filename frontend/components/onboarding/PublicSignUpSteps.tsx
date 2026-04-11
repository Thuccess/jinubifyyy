'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon, CheckIcon } from '../icons/Icons';
import { authAPI } from '../../services/api';

const getApiErrorMessage = (err: unknown) => {
  const e = err as { response?: { data?: { message?: string; errors?: { message?: string }[] } } };
  if (typeof e?.response?.data?.message === 'string') return e.response.data.message;
  const arr = e?.response?.data?.errors;
  if (Array.isArray(arr) && arr[0]?.message) return arr.map((x) => x.message).join(' ');
  return 'Something went wrong';
};

export type AccountType = 'personal' | 'business';

const STEPS_META = [
  { id: 1, label: 'Account type' },
  { id: 2, label: 'Your details' },
  { id: 3, label: 'Submit application' },
] as const;

const PersonalGlyph = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const BusinessGlyph = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
    />
  </svg>
);

interface PublicSignUpStepsProps {
  inputClass: string;
  labelClass: string;
  onComplete: (email: string) => void;
  onSwitchToSignIn: () => void;
  onClose: () => void;
}

const PublicSignUpSteps: React.FC<PublicSignUpStepsProps> = ({
  inputClass,
  labelClass,
  onComplete,
  onSwitchToSignIn,
  onClose,
}) => {
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetFlow = () => {
    setStep(0);
    setAccountType(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setCompany('');
    setWebsite('');
    setIndustry('');
    setError('');
  };

  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || email;

  const validateStep2 = (): boolean => {
    if (!firstName.trim() && !lastName.trim()) {
      setError('Please enter your name.');
      return false;
    }
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return false;
    }
    const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPassword.test(password)) {
      setError('Password must be 8+ chars and include uppercase, lowercase, number, and special character.');
      return false;
    }
    if (accountType === 'business') {
      if (!company.trim()) {
        setError('Company is required for a business account.');
        return false;
      }
      if (!phone.trim()) {
        setError('Phone is required for a business account.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const finishSuccess = () => {
    const submitted = email.trim();
    resetFlow();
    onComplete(submitted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;
    if (!accountType) {
      setError('Please select an account type.');
      return;
    }
    if (!validateStep2()) return;

    setLoading(true);
    setError('');
    try {
      await authAPI.register({
        accountType,
        name,
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        company: accountType === 'business' ? company.trim() : undefined,
        website: accountType === 'business' && website.trim() ? website.trim() : undefined,
        industry: accountType === 'business' && industry.trim() ? industry.trim() : undefined,
      });
      setStep(4);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stepsSidebar = STEPS_META.map((s) => {
    const done = step > s.id || step > 3;
    const active = step === s.id && step <= 3;
    return (
      <div
        key={s.id}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
          active
            ? 'bg-[color:var(--surface-card)] border border-border-card text-text-primary shadow-sm'
            : done
              ? 'bg-[color:var(--surface-card)]/60 border border-border-subtle text-text-secondary'
              : 'bg-[color:var(--surface-muted)] text-text-secondary'
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
            done && !active
              ? 'bg-brand-soft text-brand-primary'
              : active
                ? 'bg-brand-soft text-text-primary'
                : 'bg-[color:var(--border-subtle)] text-text-muted'
          }`}
        >
          {done && !active ? <CheckIcon className="h-4 w-4" /> : s.id}
        </span>
        <span className="text-sm font-medium">{s.label}</span>
      </div>
    );
  });

  const rightTitle =
    step === 0
      ? 'Join Jinubify 🚀'
      : step === 1
        ? 'Account type'
        : step === 2
          ? 'Your details'
          : step === 3
            ? 'Review application'
            : '';

  const rightSubtitle =
    step === 0
      ? 'A few steps to create your profile — we’ll guide you through.'
      : step === 1
        ? 'Personal or business — you can change details later with our team.'
        : step === 2
          ? accountType === 'personal'
            ? 'Tell us who you are.'
            : 'Tell us about you and your organization.'
          : step === 3
            ? 'Confirm your details, then submit. You’ll verify your email next.'
            : '';

  return (
    <div className="flex flex-col md:flex-row min-h-[520px] md:min-h-[560px] w-full">
      <div
        className={`p-6 md:p-10 md:w-[44%] flex flex-col justify-center border-b md:border-b-0 md:border-r border-border-subtle transition-colors duration-300 ${
          step === 0 || step === 4
            ? 'bg-gradient-to-br from-brand-soft/30 via-[color:var(--bg-secondary)] to-[color:var(--surface-muted)]'
            : 'bg-gradient-to-br from-[color:var(--bg-secondary)] via-[color:var(--surface-muted)]/40 to-[color:var(--bg-secondary)]'
        }`}
      >
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Jinubify</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Build your presence</h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Join creators and teams using Jinubify to share identity, content, and trust in one place.
            </p>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
              <CheckIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">You&apos;re all set</h2>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              We&apos;ll email you within 24 hours once your application is reviewed.
            </p>
          </div>
        )}
        {step >= 1 && step <= 3 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 tracking-tight">Join Jinubify</h2>
            <p className="text-text-secondary text-sm md:text-base mb-8 leading-relaxed">
              Apply for an account. We review applications and email you within 24 hours.
            </p>
            <div className="space-y-3">{stepsSidebar}</div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-8 bg-[color:var(--bg-primary)] transition-colors duration-300 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {step !== 4 && (
          <div className="flex justify-between items-start mb-6 pr-10">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">{rightTitle}</h3>
              <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-md">{rightSubtitle}</p>
            </div>
          </div>
        )}

        {step === 0 && (
          <div className="flex flex-col flex-1">
            <ul className="mt-2 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>Professional profile and verified presence</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>Secure account with email verification</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span>Human review — most applications within 24 hours</span>
              </li>
            </ul>
            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
                className="w-full h-11 rounded-xl font-semibold btn-primary transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col flex-1 pt-2">
            <h3 className="text-xl md:text-2xl font-bold text-text-primary pr-10">Application received 🎉</h3>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-md">
              Thank you for applying. Our team typically reviews new accounts within 24 hours. Watch your inbox for next
              steps and a verification link.
            </p>
            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={finishSuccess}
                className="w-full h-11 rounded-xl font-semibold btn-primary transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
              >
                Continue to sign in
              </button>
            </div>
          </div>
        )}

        {step >= 1 && step <= 3 && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('personal');
                    setError('');
                    setStep(2);
                  }}
                  className={`group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] ${
                    accountType === 'personal'
                      ? 'border-brand-primary bg-brand-soft/50 shadow-sm'
                      : 'border-border-card bg-[color:var(--surface-card)] hover:bg-surface-muted/50'
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft/80 text-brand-primary mb-3 group-hover:scale-105 transition-transform duration-200">
                    <PersonalGlyph className="h-7 w-7" />
                  </div>
                  <p className="font-semibold text-text-primary text-base">Personal</p>
                  <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">Individual use — name, email, and password.</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('business');
                    setError('');
                    setStep(2);
                  }}
                  className={`group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/40 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] ${
                    accountType === 'business'
                      ? 'border-brand-primary bg-brand-soft/50 shadow-sm'
                      : 'border-border-card bg-[color:var(--surface-card)] hover:bg-surface-muted/50'
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft/80 text-brand-primary mb-3 group-hover:scale-105 transition-transform duration-200">
                    <BusinessGlyph className="h-7 w-7" />
                  </div>
                  <p className="font-semibold text-text-primary text-base">Business</p>
                  <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">Company, contact, and optional website & industry.</p>
                </button>
              </div>
            )}

            {step === 2 && accountType && (
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="su-firstName" className={labelClass}>
                      First name
                    </label>
                    <input
                      id="su-firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label htmlFor="su-lastName" className={labelClass}>
                      Last name
                    </label>
                    <input
                      id="su-lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClass}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="su-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="su-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="su-password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="su-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className={`${inputClass} pr-11`}
                      placeholder="Strong password"
                      autoComplete="new-password"
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
                  <p className="mt-1.5 text-xs text-text-muted">
                    8+ characters with uppercase, lowercase, number, and special character.
                  </p>
                </div>
                <div>
                  <label htmlFor="su-phone" className={labelClass}>
                    Phone {accountType === 'personal' ? '(optional)' : ''}
                  </label>
                  <input
                    id="su-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+1 …"
                    required={accountType === 'business'}
                    autoComplete="tel"
                  />
                </div>
                {accountType === 'business' && (
                  <>
                    <div>
                      <label htmlFor="su-company" className={labelClass}>
                        Company
                      </label>
                      <input
                        id="su-company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className={inputClass}
                        placeholder="Company name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="su-website" className={labelClass}>
                        Website (optional)
                      </label>
                      <input
                        id="su-website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className={inputClass}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="su-industry" className={labelClass}>
                        Industry (optional)
                      </label>
                      <input
                        id="su-industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Technology"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 3 && accountType && (
              <div className="mt-2 rounded-2xl border border-border-card bg-[color:var(--surface-muted)]/50 p-5 md:p-6 space-y-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Summary</p>
                <dl className="space-y-3 text-text-secondary">
                  <div className="flex flex-wrap justify-between gap-2 border-b border-border-subtle pb-3">
                    <dt className="font-medium text-text-primary">Account</dt>
                    <dd>{accountType === 'personal' ? 'Personal' : 'Business'}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 border-b border-border-subtle pb-3">
                    <dt className="font-medium text-text-primary">Name</dt>
                    <dd className="text-right">{name}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 border-b border-border-subtle pb-3">
                    <dt className="font-medium text-text-primary">Email</dt>
                    <dd className="text-right break-all">{email}</dd>
                  </div>
                  {phone ? (
                    <div className="flex flex-wrap justify-between gap-2 border-b border-border-subtle pb-3">
                      <dt className="font-medium text-text-primary">Phone</dt>
                      <dd>{phone}</dd>
                    </div>
                  ) : null}
                  {accountType === 'business' && (
                    <>
                      <div className="flex flex-wrap justify-between gap-2 border-b border-border-subtle pb-3">
                        <dt className="font-medium text-text-primary">Company</dt>
                        <dd className="text-right">{company}</dd>
                      </div>
                      {website ? (
                        <div className="flex flex-wrap justify-between gap-2 border-b border-border-subtle pb-3">
                          <dt className="font-medium text-text-primary">Website</dt>
                          <dd className="text-right break-all">{website}</dd>
                        </div>
                      ) : null}
                      {industry ? (
                        <div className="flex flex-wrap justify-between gap-2 pb-1">
                          <dt className="font-medium text-text-primary">Industry</dt>
                          <dd>{industry}</dd>
                        </div>
                      ) : null}
                    </>
                  )}
                </dl>
                <p className="text-xs text-text-muted pt-1">Password is not shown. You can change it after activation.</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl text-sm bg-[color:var(--surface-muted)] border border-border-strong text-text-primary mt-2">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-auto pt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStep((s) => Math.max(0, s - 1));
                  }}
                  className="h-11 px-5 rounded-xl font-semibold border border-border-card text-text-primary hover:bg-surface-muted/80 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
                >
                  Back
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!validateStep2()) return;
                    setStep(3);
                  }}
                  className="flex-1 min-w-[140px] h-11 rounded-xl font-semibold btn-primary transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                >
                  Continue
                </button>
              )}
              {step === 3 && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-w-[140px] h-11 rounded-xl font-semibold btn-primary disabled:opacity-60 transition-all duration-200 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                >
                  {loading ? 'Submitting…' : 'Submit application'}
                </button>
              )}
            </div>
          </form>
        )}

        {step !== 4 && (
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-semibold text-text-primary hover:underline underline-offset-2"
            >
              Log in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicSignUpSteps;
