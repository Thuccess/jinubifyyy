'use client';

import React, { useEffect, useState } from 'react';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';
import { useIdentityAccess } from '@/components/identity/useIdentityAccess';
import { markQrOnboardingSeen } from '@/components/identity/OnboardingBanner';
import { glassCard } from '@/components/identity/identityStyles';
import { copyText, downloadDataUrlPng, shareNative } from '@/lib/identityShare';
import { userAPI } from '@/services/api';

export default function IdentityQrPage() {
  const { canEditIdentity, isRejected } = useIdentityAccess();
  const [data, setData] = useState<{ qrDataUrl: string; profileUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    markQrOnboardingSeen();
    let alive = true;
    void (async () => {
      try {
        const q = await userAPI.getMyQr();
        if (!alive) return;
        setData({ qrDataUrl: q.qrDataUrl, profileUrl: q.profileUrl });
      } catch {
        if (!alive) return;
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onCopy = async () => {
    if (!data?.profileUrl) return;
    await copyText(data.profileUrl);
    setMsg('Link copied.');
    setTimeout(() => setMsg(null), 2000);
  };

  const onShare = async () => {
    if (!data?.profileUrl) return;
    const ok = await shareNative('My profile', 'Scan or open my Jinubify profile', data.profileUrl);
    if (!ok) await onCopy();
  };

  const onDownload = () => {
    if (!data?.qrDataUrl) return;
    downloadDataUrlPng(data.qrDataUrl, 'jinubify-profile-qr.png');
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {isRejected ? (
        <div className={`${glassCard} p-4 text-sm text-text-secondary`}>
          QR downloads and sharing are disabled while your account is rejected.
        </div>
      ) : null}
      {msg ? <p className="text-center text-sm text-brand-primary">{msg}</p> : null}

      <div className={`${glassCard} flex flex-col items-center px-6 py-8 sm:py-10`}>
        <h1 className="text-center text-lg font-bold text-text-primary">Your QR code</h1>
        <p className="mt-2 text-center text-sm text-text-muted">Scan to view your profile</p>
        {loading ? (
          <SkeletonBlock className="mt-8 h-64 w-64" rounded="2xl" />
        ) : data ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={data.qrDataUrl}
            alt="Profile QR code"
            className="mt-8 h-64 w-64 rounded-2xl border border-white/30 shadow-lg"
          />
        ) : (
          <p className="mt-8 text-sm text-text-muted">Could not load QR.</p>
        )}
        {data?.profileUrl ? (
          <p className="mt-6 max-w-full truncate text-center text-xs text-text-muted">{data.profileUrl}</p>
        ) : null}

        <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={!data || !canEditIdentity}
            onClick={onDownload}
            className="rounded-xl border border-border-card bg-surface-muted px-4 py-2 text-sm font-semibold disabled:opacity-45"
          >
            Download PNG
          </button>
          <button
            type="button"
            disabled={!data || !canEditIdentity}
            onClick={() => void onShare()}
            className="rounded-xl border border-border-card bg-surface-muted px-4 py-2 text-sm font-semibold disabled:opacity-45"
          >
            Share
          </button>
          <button
            type="button"
            disabled={!data || !canEditIdentity}
            onClick={() => void onCopy()}
            className="rounded-xl border border-border-card bg-surface-muted px-4 py-2 text-sm font-semibold disabled:opacity-45"
          >
            Copy link
          </button>
        </div>

        <div className="mt-8 w-full rounded-xl border border-dashed border-border-subtle bg-surface-muted/30 px-4 py-3 text-center text-[11px] text-text-muted">
          Coming soon: custom QR colors and a logo embedded in the code.
        </div>
      </div>
    </div>
  );
}
