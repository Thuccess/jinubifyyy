'use client';

import React from 'react';
import type { SocialLink } from '@/types';
import { glassCard } from '@/components/identity/identityStyles';

export type ProfileDraft = {
  accountType?: 'personal' | 'business';
  name: string;
  company?: string;
  photoURL?: string;
  publicTagline?: string;
  publicBio?: string;
  website?: string;
  phone?: string;
  email?: string;
  profileSlug?: string | null;
  socialLinks?: SocialLink[];
  brandGuidelines?: { logoUrl?: string; primaryColor?: string; secondaryColor?: string; toneOfVoice?: string };
};

export function LiveProfilePreview({
  draft,
  slugPreview,
  className = '',
}: {
  draft: ProfileDraft;
  slugPreview: string;
  className?: string;
}) {
  const accountType = draft.accountType || 'personal';
  const displayName =
    accountType === 'business' && draft.company?.trim() ? draft.company.trim() : draft.name || 'Your name';
  const hero =
    accountType === 'business' && draft.brandGuidelines?.logoUrl?.trim()
      ? draft.brandGuidelines.logoUrl.trim()
      : draft.photoURL?.trim() || '';
  const lead = draft.publicTagline?.trim() || '';
  const slugShow = slugPreview || 'your-handle';

  return (
    <div
      className={`${glassCard} overflow-hidden ${className}`}
      aria-label="Live preview of your public profile"
    >
      <div className="relative aspect-[4/5] max-h-[min(520px,70vh)] w-full">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-500/30 to-cyan-500/25 text-4xl font-bold text-text-muted">
            {(displayName.charAt(0) || '?').toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-12 backdrop-blur-[12px]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Public preview</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white">{displayName}</h2>
          <p className="mt-0.5 text-sm text-violet-200/90">@{slugShow}</p>
          {lead ? <p className="mt-2 line-clamp-2 text-sm text-white/85">{lead}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {(draft.socialLinks || []).slice(0, 6).map((l) => (
              <span
                key={l.platform}
                className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white/95 ring-1 ring-white/20"
              >
                {l.platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
