'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';
import {
  ArrowRightIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  LinkIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from '@/components/icons/Icons';
import { useIdentityAccess } from '@/components/identity/useIdentityAccess';
import { useIdentityProfile } from '@/components/identity/useIdentityProfile';
import { OnboardingBanner } from '@/components/identity/OnboardingBanner';
import { glassCard } from '@/components/identity/identityStyles';
import { copyText, downloadDataUrlPng, shareNative } from '@/lib/identityShare';
import { userAPI } from '@/services/api';

function StatusBadge({ status }: { status: string }) {
  const s = status || 'pending';
  if (s === 'approved') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30">
        Approved
      </span>
    );
  }
  if (s === 'rejected') {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/30">
      Pending
    </span>
  );
}

export default function IdentityOverview() {
  const { profile, loading } = useIdentityProfile();
  const { canEditIdentity, isRejected, status } = useIdentityAccess();
  const [analytics, setAnalytics] = useState<{
    profileViews: number;
    qrScans: number;
    linkClicks: number;
    contactsSaved: number;
  } | null>(null);
  const [qr, setQr] = useState<{ qrDataUrl: string; profileUrl: string } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    let alive = true;
    void (async () => {
      try {
        const [a, q] = await Promise.all([userAPI.getAnalyticsSummary(7), userAPI.getMyQr()]);
        if (!alive) return;
        setAnalytics({
          profileViews: a.profileViews,
          qrScans: a.qrScans,
          linkClicks: a.linkClicks,
          contactsSaved: a.contactsSaved,
        });
        setQr({ qrDataUrl: q.qrDataUrl, profileUrl: q.profileUrl });
      } catch {
        if (!alive) return;
        setAnalytics(null);
        setQr(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loading, profile?.updatedAt]);

  const displayName =
    profile?.accountType === 'business' && profile.company?.trim()
      ? profile.company.trim()
      : profile?.name || '—';
  const slug = profile?.profileSlug?.trim() || '';
  const avatar =
    profile?.photoURL ||
    (profile?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`
      : '');

  const shareProfile = async () => {
    if (!qr?.profileUrl) return;
    const ok = await shareNative('My Jinubify profile', 'View my profile', qr.profileUrl);
    if (!ok) await copyText(qr.profileUrl);
    setFeedback('Link ready to share.');
    setTimeout(() => setFeedback(null), 2200);
  };

  const copyProfile = async () => {
    if (!qr?.profileUrl) return;
    await copyText(qr.profileUrl);
    setFeedback('Link copied.');
    setTimeout(() => setFeedback(null), 2200);
  };

  const downloadQr = () => {
    if (!qr?.qrDataUrl) return;
    downloadDataUrlPng(qr.qrDataUrl, `jinubify-profile-qr-${slug || 'user'}.png`);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <OnboardingBanner profile={profile} loading={loading} />

      {isRejected ? (
        <div
          className={`${glassCard} border-rose-500/25 px-4 py-3 text-sm text-rose-900 dark:text-rose-100`}
          role="alert"
        >
          Your application was not approved. You can still view your account status and settings. Profile edits are
          disabled.
        </div>
      ) : null}

      {feedback ? (
        <p className="text-xs font-medium text-brand-primary" role="status">
          {feedback}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${glassCard} p-4 sm:p-6`}>
          {loading ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-20 w-full" rounded="xl" />
              <SkeletonBlock className="h-4 w-2/3" rounded="full" />
            </div>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Profile summary</p>
              <div className="mt-3 flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-2xl border border-white/40 object-cover shadow-md dark:border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight text-text-primary">{displayName}</h1>
                    <StatusBadge status={profile?.status || status} />
                  </div>
                  <p className="mt-0.5 text-sm text-violet-600 dark:text-violet-300">
                    {slug ? `@${slug}` : 'No public handle yet'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`${glassCard} p-4 sm:p-6`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">QR preview</p>
          {loading || !qr ? (
            <div className="mt-4 flex justify-center">
              <SkeletonBlock className="h-36 w-36" rounded="xl" />
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr.qrDataUrl} alt="" className="h-36 w-36 rounded-xl border border-white/30 shadow-md" />
              <p className="max-w-[280px] truncate text-center text-xs text-text-muted">{qr.profileUrl}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  disabled={!canEditIdentity}
                  onClick={downloadQr}
                  className="rounded-xl border border-border-card bg-surface-muted/80 px-3 py-1.5 text-xs font-semibold disabled:opacity-45"
                >
                  Download
                </button>
                <button
                  type="button"
                  disabled={!canEditIdentity}
                  onClick={() => void shareProfile()}
                  className="rounded-xl border border-border-card bg-surface-muted/80 px-3 py-1.5 text-xs font-semibold disabled:opacity-45"
                >
                  Share
                </button>
                <button
                  type="button"
                  disabled={!canEditIdentity}
                  onClick={() => void copyProfile()}
                  className="rounded-xl border border-border-card bg-surface-muted/80 px-3 py-1.5 text-xs font-semibold disabled:opacity-45"
                >
                  Copy link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Last 7 days</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Profile views', v: analytics?.profileViews },
            { label: 'QR scans', v: analytics?.qrScans },
            { label: 'Link clicks', v: analytics?.linkClicks },
            { label: 'Contacts saved', v: analytics?.contactsSaved },
          ].map((row) => (
            <div key={row.label} className={`${glassCard} px-3 py-3 sm:px-4 sm:py-4`}>
              {analytics == null && loading ? (
                <SkeletonBlock className="h-8 w-16" rounded="lg" />
              ) : (
                <p className="text-2xl font-bold tabular-nums text-text-primary">{row.v ?? '—'}</p>
              )}
              <p className="mt-1 text-[11px] font-medium text-text-muted">{row.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Quick actions</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/profile"
            className={`${glassCard} flex items-center gap-3 p-4 transition hover:ring-1 hover:ring-brand-primary/25 ${
              !canEditIdentity ? 'pointer-events-none opacity-45' : ''
            }`}
          >
            <PencilSquareIcon className="h-5 w-5 text-brand-primary" />
            <span className="text-sm font-semibold">Edit profile</span>
            <ArrowRightIcon className="ml-auto h-4 w-4 text-text-muted" />
          </Link>
          <Link
            href="/dashboard/social"
            className={`${glassCard} flex items-center gap-3 p-4 transition hover:ring-1 hover:ring-brand-primary/25 ${
              !canEditIdentity ? 'pointer-events-none opacity-45' : ''
            }`}
          >
            <LinkIcon className="h-5 w-5 text-brand-primary" />
            <span className="text-sm font-semibold">Add social link</span>
            <ArrowRightIcon className="ml-auto h-4 w-4 text-text-muted" />
          </Link>
          <button
            type="button"
            disabled={!canEditIdentity}
            onClick={() => void shareProfile()}
            className={`${glassCard} flex w-full items-center gap-3 p-4 text-left transition hover:ring-1 hover:ring-brand-primary/25 disabled:opacity-45`}
          >
            <UserCircleIcon className="h-5 w-5 text-brand-primary" />
            <span className="text-sm font-semibold">Share profile</span>
            <ArrowRightIcon className="ml-auto h-4 w-4 text-text-muted" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/analytics"
          className={`inline-flex items-center gap-2 ${glassCard} px-4 py-2.5 text-sm font-semibold`}
        >
          <ChartBarIcon className="h-4 w-4" />
          Full analytics
        </Link>
        <Link
          href="/dashboard/qr"
          className={`inline-flex items-center gap-2 ${glassCard} px-4 py-2.5 text-sm font-semibold`}
        >
          <DevicePhoneMobileIcon className="h-4 w-4" />
          QR code page
        </Link>
      </div>
    </div>
  );
}
