'use client';

import React, { useEffect, useState } from 'react';
import SkeletonBlock from '@/components/skeletons/SkeletonBlock';
import { glassCard } from '@/components/identity/identityStyles';
import { userAPI } from '@/services/api';
import { ConnectionIcon, DevicePhoneMobileIcon, LinkIcon } from '@/components/icons/Icons';

type Period = 7 | 30;

export default function IdentityAnalytics() {
  const [days, setDays] = useState<Period>(7);
  const [data, setData] = useState<Awaited<ReturnType<typeof userAPI.getAnalyticsSummary>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      setLoading(true);
      try {
        const d = await userAPI.getAnalyticsSummary(days);
        if (alive) setData(d);
      } catch {
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [days]);

  const rows = [
    { label: 'Opens + QR scans', value: (data?.profileViews || 0) + (data?.qrScans || 0), Icon: ConnectionIcon },
    { label: 'QR scans', value: data?.qrScans || 0, Icon: DevicePhoneMobileIcon },
    { label: 'Link clicks', value: data?.linkClicks || 0, Icon: LinkIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-text-primary">Analytics</h1>
        <div className={`${glassCard} flex p-0.5`}>
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-[14px] px-3 py-1.5 text-xs font-semibold transition ${
                days === d ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className={`${glassCard} px-4 py-4`}>
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-primary">
              <r.Icon className="h-4 w-4" />
            </div>
            {loading ? (
              <SkeletonBlock className="h-9 w-20" rounded="lg" />
            ) : (
              <p className="text-3xl font-bold tabular-nums text-text-primary">{r.value}</p>
            )}
            <p className="mt-1 text-xs font-medium text-text-muted">{r.label}</p>
          </div>
        ))}
      </div>

      <div className={`${glassCard} p-4 sm:p-6`}>
        <h2 className="text-sm font-bold text-text-primary">Top performing links</h2>
        <p className="mt-1 text-xs text-text-muted">By click target on your public profile</p>
        {loading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-full" rounded="lg" />
            ))}
          </div>
        ) : !data?.topLinks?.length ? (
          <p className="mt-4 text-sm text-text-muted">No link clicks in this period yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-subtle">
            {data.topLinks.map((t) => (
              <li key={t.target} className="flex items-center justify-between py-3 text-sm first:pt-0">
                <span className="font-medium text-text-primary">{t.target}</span>
                <span className="tabular-nums text-text-muted">{t.count} clicks</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
