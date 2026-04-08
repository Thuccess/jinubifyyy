'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { UserProfile } from '@/types/user';
import { glassCard } from '@/components/identity/identityStyles';
import { CheckIcon } from '@/components/icons/Icons';

const STORAGE_DISMISS = 'jinubify-identity-onboarding-dismiss';

function stepDone(profile: UserProfile | null, key: string): boolean {
  if (!profile) return false;
  switch (key) {
    case 'photo':
      return Boolean(
        profile.photoURL &&
          !String(profile.photoURL).includes('ui-avatars.com') &&
          String(profile.photoURL).trim() !== '',
      );
    case 'bio':
      return Boolean((profile.publicBio || profile.publicTagline || '').trim());
    case 'social':
      return (profile.socialLinks?.length || 0) > 0;
    case 'qr':
      return typeof window !== 'undefined' && window.localStorage.getItem('jinubify-identity-qr-seen') === '1';
    default:
      return false;
  }
}

export function OnboardingBanner({
  profile,
  loading,
}: {
  profile: UserProfile | null;
  loading: boolean;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_DISMISS) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  const steps = useMemo(() => {
    const keys = ['photo', 'bio', 'social', 'qr'] as const;
    return keys.map((k) => ({
      key: k,
      label:
        k === 'photo'
          ? 'Profile image / logo'
          : k === 'bio'
            ? 'Bio or tagline'
            : k === 'social'
              ? 'At least one social link'
              : 'View your QR code',
      done: stepDone(profile, k),
    }));
  }, [profile]);

  const pct = useMemo(() => {
    const n = steps.filter((s) => s.done).length;
    return Math.round((n / steps.length) * 100);
  }, [steps]);

  const allDone = pct >= 100;

  if (loading || dismissed || allDone) return null;

  return (
    <div
      className={`${glassCard} mb-6 p-4 sm:p-5 border-violet-400/25 dark:border-violet-400/20`}
      role="region"
      aria-label="Getting started"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Set up your public profile</p>
          <h2 className="mt-1 text-base font-bold text-text-primary sm:text-lg">Finish your digital identity</h2>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-text-muted hover:text-text-secondary"
          onClick={() => {
            try {
              window.localStorage.setItem(STORAGE_DISMISS, '1');
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
        >
          Dismiss
        </button>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-text-muted">{pct}% complete</p>
      <ul className="mt-3 space-y-2">
        {steps.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                s.done ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-surface-muted text-text-muted'
              }`}
            >
              {s.done ? <CheckIcon className="h-3.5 w-3.5" /> : <span className="text-[11px] font-bold">—</span>}
            </span>
            <span className={s.done ? 'text-text-muted line-through' : 'text-text-primary'}>{s.label}</span>
            {s.key === 'qr' && !s.done ? (
              <Link href="/dashboard/qr" className="ml-auto text-xs font-semibold text-brand-primary">
                Open
              </Link>
            ) : null}
            {s.key === 'social' && !s.done ? (
              <Link href="/dashboard/social" className="ml-auto text-xs font-semibold text-brand-primary">
                Add
              </Link>
            ) : null}
            {s.key === 'photo' && !s.done ? (
              <Link href="/dashboard/profile" className="ml-auto text-xs font-semibold text-brand-primary">
                Edit
              </Link>
            ) : null}
            {s.key === 'bio' && !s.done ? (
              <Link href="/dashboard/profile" className="ml-auto text-xs font-semibold text-brand-primary">
                Edit
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function markQrOnboardingSeen(): void {
  try {
    window.localStorage.setItem('jinubify-identity-qr-seen', '1');
  } catch {
    /* ignore */
  }
}
