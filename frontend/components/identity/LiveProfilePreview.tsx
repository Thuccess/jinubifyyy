'use client';

import React, { useMemo } from 'react';
import type { SocialLink } from '@/types';
import { glassCard } from '@/components/identity/identityStyles';
import { rgbaFromHex, textLuminance } from '@/lib/publicProfileTheme';

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
  brandGuidelines?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    toneOfVoice?: string;
    publicProfileAccentColor?: string;
    publicProfileTextColor?: string;
    publicProfileBackgroundColor?: string;
  };
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
  const accentColor = draft.brandGuidelines?.publicProfileAccentColor?.trim() ?? '';
  const textColor = draft.brandGuidelines?.publicProfileTextColor?.trim() ?? '';
  const backgroundColor = draft.brandGuidelines?.publicProfileBackgroundColor?.trim() ?? '';
  const usePublicProfileColors = Boolean(accentColor || textColor || backgroundColor);

  const overlayThemeStyle = useMemo((): React.CSSProperties | undefined => {
    if (!usePublicProfileColors) return undefined;
    const textL = textColor ? textLuminance(textColor) : null;
    const bgL = backgroundColor ? textLuminance(backgroundColor) : null;
    const previewDark =
      textL != null ? textL > 0.45 : bgL != null ? bgL < 0.42 : true;
    return {
      '--pp-text': textColor
        ? textColor
        : previewDark
          ? 'rgba(255,255,255,0.92)'
          : 'rgb(15 23 42)',
      '--pp-muted': textColor
        ? rgbaFromHex(textColor, 0.72) || 'rgba(255,255,255,0.65)'
        : previewDark
          ? 'rgba(255,255,255,0.65)'
          : 'rgba(51,65,85,0.78)',
      '--pp-accent': accentColor || (previewDark ? '#93c5fd' : '#4f46e5'),
    } as React.CSSProperties;
  }, [accentColor, textColor, backgroundColor, usePublicProfileColors]);

  const titleClass = usePublicProfileColors
    ? 'mt-1 text-xl font-bold tracking-tight text-[color:var(--pp-text)]'
    : 'mt-1 text-xl font-bold tracking-tight text-white';
  const slugClass = usePublicProfileColors
    ? 'mt-0.5 text-sm text-[color:var(--pp-muted)]'
    : 'mt-0.5 text-sm text-violet-200/90';
  const leadClass = usePublicProfileColors
    ? 'mt-2 line-clamp-2 text-sm text-[color:var(--pp-text)]'
    : 'mt-2 line-clamp-2 text-sm text-white/85';
  const chipClass = usePublicProfileColors
    ? 'rounded-full border border-solid px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--pp-text)]'
    : 'rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white/95 ring-1 ring-white/20';
  const chipStyle: React.CSSProperties | undefined = usePublicProfileColors
    ? accentColor
      ? {
          borderColor: rgbaFromHex(accentColor, 0.45),
          backgroundColor: rgbaFromHex(accentColor, 0.15),
        }
      : textColor
        ? {
            borderColor: rgbaFromHex(textColor, 0.35),
            backgroundColor: rgbaFromHex(textColor, 0.1),
          }
        : { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.08)' }
    : undefined;

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
        <div
          className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-12 backdrop-blur-[12px]"
          style={{
            ...(backgroundColor ? { backgroundColor: rgbaFromHex(backgroundColor, 0.88) || backgroundColor } : {}),
            ...overlayThemeStyle,
          }}
        >
          <p
            className={
              usePublicProfileColors
                ? 'text-[10px] font-semibold uppercase tracking-wider text-[color:var(--pp-muted)]'
                : 'text-[10px] font-semibold uppercase tracking-wider text-white/70'
            }
          >
            Public preview
          </p>
          <h2 className={titleClass}>{displayName}</h2>
          <p className={slugClass}>@{slugShow}</p>
          {lead ? <p className={leadClass}>{lead}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {(draft.socialLinks || []).slice(0, 6).map((l) => (
              <span key={l.platform} className={chipClass} style={chipStyle}>
                {l.platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
