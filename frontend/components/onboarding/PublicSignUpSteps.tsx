'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '../icons/Icons';
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

interface PublicSignUpStepsProps {
  inputClass: string;
  labelClass: string;
  oauthBtnClass: string;
  onOAuthGoogle: () => void;
  onOAuthGithub: () => void;
  onComplete: (email: string) => void;
  onSwitchToSignIn: () => void;
  onClose: () => void;
}

const PublicSignUpSteps: React.FC<PublicSignUpStepsProps> = ({
  inputClass,
  labelClass,
  oauthBtnClass,
  onOAuthGoogle,
  onOAuthGithub,
  onComplete,
  onSwitchToSignIn,
  onClose,
}) => {
  const [step, setStep] = useState(1);
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
    setStep(1);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      resetFlow();
      onComplete(email.trim());
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stepsSidebar = STEPS_META.map((s) => {
    const active = step === s.id;
    return (
      <div
        key={s.id}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 ${
          active
            ? 'bg-[color:var(--surface-card)] border border-border-card text-text-primary'
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
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[520px] md:min-h-[560px] w-full">
      <div className="bg-[color:var(--bg-secondary)] p-6 md:p-8 md:w-[42%] flex flex-col justify-center border-b md:border-b-0 md:border-r border-border-subtle transition-colors duration-300">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Get Started with Us</h2>
        <p className="text-text-secondary text-sm md:text-base mb-8">
          Apply for a Jinubify account. We review applications and email you within 24 hours.
        </p>
        <div className="space-y-3">{stepsSidebar}</div>
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-8 bg-[color:var(--bg-primary)] transition-colors duration-300 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex justify-between items-start mb-6 pr-10">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-text-primary">
              {step === 1 ? 'Choose account type' : step === 2 ? 'Your details' : 'Review & submit'}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {step === 1
                ? 'Personal or business — you can change details later with our team.'
                : step === 2
                  ? accountType === 'personal'
                    ? 'Tell us who you are.'
                    : 'Tell us about you and your organization.'
                  : 'Submit when you’re ready. You’ll verify your email next.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setAccountType('personal');
                  setError('');
                  setStep(2);
                }}
                className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] ${
                  accountType === 'personal'
                    ? 'border-brand-primary bg-brand-soft/40'
                    : 'border-border-card bg-[color:var(--surface-card)] hover:bg-surface-muted/80'
                }`}
              >
                <p className="font-semibold text-text-primary">Personal</p>
                <p className="mt-1 text-sm text-text-secondary">Individual use, name, email, and password.</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType('business');
                  setError('');
                  setStep(2);
                }}
                className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] ${
                  accountType === 'business'
                    ? 'border-brand-primary bg-brand-soft/40'
                    : 'border-border-card bg-[color:var(--surface-card)] hover:bg-surface-muted/80'
                }`}
              >
                <p className="font-semibold text-text-primary">Business</p>
                <p className="mt-1 text-sm text-text-secondary">Company, contact, and optional website & industry.</p>
              </button>
            </div>
          )}

          {step === 2 && accountType && (
            <>
              <div className="flex gap-3">
                <button type="button" onClick={onOAuthGoogle} className={oauthBtnClass}>
                  <span className="font-semibold">G</span> Google
                </button>
                <button type="button" onClick={onOAuthGithub} className={oauthBtnClass}>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.208-.007-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 2.24-1.296 2.75-1.026 2.75-1.026.544 1.379.202 2.397.098 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Github
                </button>
              </div>
              <p className="text-center text-xs text-text-muted">Or</p>
              <div className="grid grid-cols-2 gap-3">
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
                    className={`${inputClass} pr-10`}
                    placeholder="Strong password"
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
                <p className="mt-1 text-xs text-text-muted">
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
            </>
          )}

          {step === 3 && accountType && (
            <div className="rounded-xl border border-border-card bg-[color:var(--surface-muted)]/60 p-4 text-sm text-text-secondary space-y-2">
              <p>
                <span className="font-medium text-text-primary">Account:</span>{' '}
                {accountType === 'personal' ? 'Personal' : 'Business'}
              </p>
              <p>
                <span className="font-medium text-text-primary">Name:</span> {name}
              </p>
              <p>
                <span className="font-medium text-text-primary">Email:</span> {email}
              </p>
              {phone ? (
                <p>
                  <span className="font-medium text-text-primary">Phone:</span> {phone}
                </p>
              ) : null}
              {accountType === 'business' && (
                <>
                  <p>
                    <span className="font-medium text-text-primary">Company:</span> {company}
                  </p>
                  {website ? (
                    <p>
                      <span className="font-medium text-text-primary">Website:</span> {website}
                    </p>
                  ) : null}
                  {industry ? (
                    <p>
                      <span className="font-medium text-text-primary">Industry:</span> {industry}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-sm bg-[color:var(--surface-muted)] border border-border-strong text-text-primary">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-auto pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep((s) => Math.max(1, s - 1));
                }}
                className="py-3 px-4 rounded-xl font-semibold border border-border-card text-text-primary hover:bg-surface-muted/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
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
                className="flex-1 py-3 rounded-xl font-semibold btn-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
              >
                Continue
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold btn-primary disabled:opacity-60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
              >
                {loading ? 'Submitting…' : 'Submit application'}
              </button>
            )}
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToSignIn} className="font-medium text-text-primary hover:underline">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default PublicSignUpSteps;
