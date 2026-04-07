'use client';

/**
 * Public profile card for /u/:slug (QR landing). Theme-aware; full profile payload; real view counts.
 */

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { FaEnvelope, FaEye, FaGlobe, FaLink, FaPhone } from 'react-icons/fa';
import {
  normalizeSocialPlatformId,
  SOCIAL_PLATFORM_META,
  SocialPlatformGlyph,
} from '@/lib/socialPlatforms';
import { publicAPI, type PublicProfilePayload } from '../../services/api';

/** Short hero line: tagline only, not full bio */
function heroLead(p: PublicProfilePayload): string {
  if (p.publicTagline) return p.publicTagline;
  if (p.industry) return p.industry;
  if (p.tagline) return p.tagline;
  return '';
}

/** Smooth scalloped / rosette outer path (no rectangular box). */
function scallopedSealPath(
  cx: number,
  cy: number,
  meanR: number,
  waveAmp: number,
  lobes: number,
  samples: number,
): string {
  let d = '';
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const r = meanR + waveAmp * Math.sin(lobes * t);
    const x = cx + r * Math.cos(t - Math.PI / 2);
    const y = cy + r * Math.sin(t - Math.PI / 2);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(3)} ${y.toFixed(3)}`;
  }
  return `${d}Z`;
}

const SEAL_PATH = scallopedSealPath(12, 12, 9.35, 1.42, 20, 200);

/** Reference-style scalloped seal + centred check; check is knocked out so hero shows through. Monochrome: black (light) / white (dark). */
function VerifiedAccountBadge({ isDark }: { isDark: boolean }) {
  const rawId = useId();
  const maskId = useMemo(() => `vf-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [rawId]);
  const sealClass = isDark
    ? 'text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.75)]'
    : 'text-black drop-shadow-[0_0_4px_rgba(255,255,255,0.95)]';

  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      className={`shrink-0 ${sealClass}`}
      role="img"
      aria-label="Verified account"
    >
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <g fill="black" transform="translate(12,12) scale(0.72) translate(-10,-10)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            />
          </g>
        </mask>
      </defs>
      <path fill="currentColor" mask={`url(#${maskId})`} d={SEAL_PATH} />
    </svg>
  );
}

type LoadState = 'loading' | 'ready' | 'error';

const ProfileCardPage: React.FC = () => {
  const { theme } = useTheme();
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [state, setState] = useState<LoadState>('loading');
  const [profile, setProfile] = useState<PublicProfilePayload | null>(null);
  const [displayedViews, setDisplayedViews] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const linksCount = profile?.socialLinks?.length ?? 0;

  const track = useCallback(
    (target: string) => {
      if (!slug) return;
      void publicAPI.trackProfileClick(slug, target);
    },
    [slug],
  );

  const openTracked = useCallback(
    (target: string, href: string) => {
      track(target);
      window.open(href, '_blank', 'noopener,noreferrer');
    },
    [track],
  );

  useEffect(() => {
    if (!slug) {
      setState('error');
      return;
    }
    let alive = true;
    (async () => {
      try {
        const res = await publicAPI.getProfileBySlug(slug);
        if (!alive) return;
        setProfile(res.profile);
        setDisplayedViews(Number(res.profile.viewCount) || 0);
        setState('ready');
      } catch {
        if (!alive) return;
        setProfile(null);
        setState('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug || state !== 'ready' || !profile) return;
    if (typeof window === 'undefined') return;
    const key = `jinubify-public-profile-view:${slug}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
    void (async () => {
      const ok = await publicAPI.trackProfileView(slug);
      if (ok) setDisplayedViews((v) => v + 1);
    })();
  }, [slug, state, profile]);

  const isDark = theme === 'dark';
  const lead = profile ? heroLead(profile) : '';

  return (
    <div className="w-full min-h-0 text-text-primary antialiased pb-10">
      <div className="flex flex-col items-center px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="self-start mb-4 sm:mb-6 text-xs font-medium text-text-muted hover:text-text-primary transition-colors tracking-wide"
        >
          ← Back to Jinubify
        </Link>

        {state === 'loading' && (
          <div
            className="w-full max-w-[380px] aspect-[3/4] max-h-[85vh] rounded-[28px] overflow-hidden border border-border-subtle bg-[color:var(--surface-muted)] animate-pulse"
            aria-busy="true"
            aria-label="Loading profile"
          >
            <div className="h-full w-full bg-gradient-to-t from-[color:var(--surface-card)] to-transparent opacity-60" />
          </div>
        )}

        {state === 'error' && (
          <div
            className="w-full max-w-[380px] rounded-[28px] border border-border-card bg-[color:var(--surface-card)] px-8 py-14 text-center text-text-secondary text-sm shadow-sm"
            role="alert"
          >
            This profile isn&apos;t available.
          </div>
        )}

        {state === 'ready' && profile && (
          <div className="w-full max-w-[380px] space-y-8">
            <div
              className="transition-transform duration-500 ease-out hover:scale-[1.02] hover:z-10 motion-reduce:transform-none motion-reduce:hover:scale-100"
              style={{ perspective: '1200px' }}
            >
              <article
                className={`relative w-full aspect-[3/4] max-h-[85vh] rounded-[28px] overflow-hidden border shadow-lg ${
                  isDark
                    ? 'border-white/[0.12] bg-black/40 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06),0_0_80px_-24px_rgba(124,58,237,0.35)]'
                    : 'border-border-card bg-[color:var(--surface-card)] shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12)]'
                }`}
                aria-label={`Profile of ${profile.displayName}`}
              >
                {profile.heroImageUrl && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote user media
                  <img
                    src={profile.heroImageUrl}
                    alt=""
                    width={760}
                    height={1014}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                      imgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[color:var(--surface-muted)] to-[color:var(--bg-secondary)] text-5xl font-bold text-text-muted"
                    aria-hidden
                  >
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div
                  className={`absolute inset-0 pointer-events-none ${
                    isDark
                      ? 'bg-gradient-to-t from-black via-black/55 to-black/15'
                      : 'bg-gradient-to-t from-[color:var(--bg-primary)] via-[color:var(--bg-primary)]/70 to-transparent'
                  }`}
                  aria-hidden
                />

                <div className="absolute inset-x-0 bottom-0 top-[40%] flex flex-col justify-end pointer-events-none">
                  <div
                    className={`pointer-events-auto px-5 pb-7 pt-16 sm:px-6 sm:pb-8 backdrop-blur-[20px] border-t ${
                      isDark
                        ? 'bg-gradient-to-t from-black/85 via-black/45 to-transparent supports-[backdrop-filter]:bg-black/35 border-white/[0.08]'
                        : 'bg-gradient-to-t from-[color:var(--bg-primary)]/95 via-[color:var(--bg-primary)]/65 to-transparent supports-[backdrop-filter]:bg-[color:var(--bg-primary)]/75 border-border-subtle'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <h1
                        className={`text-2xl sm:text-[1.65rem] font-bold tracking-tight leading-tight ${
                          isDark ? 'text-white' : 'text-text-primary'
                        }`}
                      >
                        {profile.displayName}
                      </h1>
                      {profile.verified ? <VerifiedAccountBadge isDark={isDark} /> : null}
                    </div>

                    {lead ? (
                      <p
                        className={`mt-2 text-sm sm:text-[15px] leading-snug line-clamp-2 ${
                          isDark ? 'text-white/80' : 'text-text-secondary'
                        }`}
                      >
                        {lead}
                      </p>
                    ) : null}

                    <div
                      className={`mt-5 flex flex-row items-center justify-start gap-6 text-sm tabular-nums ${
                        isDark ? 'text-white/90' : 'text-text-primary'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <FaEye
                          className={isDark ? 'h-3.5 w-3.5 text-white/70' : 'h-3.5 w-3.5 text-text-muted'}
                          aria-hidden
                        />
                        {displayedViews.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FaLink
                          className={isDark ? 'h-3.5 w-3.5 text-white/70' : 'h-3.5 w-3.5 text-text-muted'}
                          aria-hidden
                        />
                        {linksCount}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <div className="space-y-6 text-sm">
              <p className="text-xs text-text-muted">
                <span className="font-semibold text-text-secondary capitalize">{profile.accountType}</span>
                {profile.accountType === 'business' && profile.name && profile.displayName !== profile.name
                  ? ` · ${profile.name}`
                  : null}
                {profile.company && profile.displayName !== profile.company ? ` · ${profile.company}` : null}
              </p>

              {profile.about ? (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">About</h2>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{profile.about}</p>
                </section>
              ) : null}

              {profile.industry && lead !== profile.industry ? (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Industry
                  </h2>
                  <p className="text-text-secondary">{profile.industry}</p>
                </section>
              ) : null}

              {profile.publicTagline && profile.publicTagline !== lead ? (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Tagline
                  </h2>
                  <p className="text-text-secondary">{profile.publicTagline}</p>
                </section>
              ) : null}

              {profile.brandGuidelines?.toneOfVoice ? (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Brand voice
                  </h2>
                  <p className="text-text-secondary">{profile.brandGuidelines.toneOfVoice}</p>
                </section>
              ) : null}

              {(profile.brandGuidelines?.primaryColor || profile.brandGuidelines?.secondaryColor) && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Brand colors</h2>
                  <div className="flex flex-wrap gap-3">
                    {profile.brandGuidelines.primaryColor ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-8 w-8 rounded-lg border border-border-subtle shadow-inner"
                          style={{ backgroundColor: profile.brandGuidelines.primaryColor }}
                          title={profile.brandGuidelines.primaryColor}
                        />
                        <span className="text-text-muted text-xs font-mono">{profile.brandGuidelines.primaryColor}</span>
                      </span>
                    ) : null}
                    {profile.brandGuidelines.secondaryColor ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-8 w-8 rounded-lg border border-border-subtle shadow-inner"
                          style={{ backgroundColor: profile.brandGuidelines.secondaryColor }}
                          title={profile.brandGuidelines.secondaryColor}
                        />
                        <span className="text-text-muted text-xs font-mono">
                          {profile.brandGuidelines.secondaryColor}
                        </span>
                      </span>
                    ) : null}
                  </div>
                </section>
              )}

              {profile.preferredChannels && profile.preferredChannels.length > 0 ? (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Preferred channels
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredChannels.map((ch) => (
                      <span
                        key={ch}
                        className="rounded-full border border-border-card bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-medium text-text-primary"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Contact</h2>
                <ul className="space-y-2.5">
                  {profile.email ? (
                    <li className="flex items-center gap-2">
                      <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
                      <a
                        href={`mailto:${encodeURIComponent(profile.email)}`}
                        className="text-brand-primary font-medium hover:underline break-all"
                        onClick={() => track('mail')}
                      >
                        {profile.email}
                      </a>
                    </li>
                  ) : null}
                  {profile.phone ? (
                    <li className="flex items-center gap-2">
                      <FaPhone className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
                      <a
                        href={`tel:${profile.phone.replace(/\s/g, '')}`}
                        className="text-text-primary font-medium hover:underline"
                        onClick={() => track('phone')}
                      >
                        {profile.phone}
                      </a>
                    </li>
                  ) : null}
                  {profile.website ? (
                    <li className="flex items-center gap-2">
                      <FaGlobe className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary font-medium hover:underline break-all"
                        onClick={() => track('website')}
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </section>

              {profile.socialLinks && profile.socialLinks.length > 0 ? (
                <section aria-label="Social links">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Social</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.socialLinks.map((link) => {
                      const id = normalizeSocialPlatformId(link.platform);
                      if (!id) return null;
                      const label = SOCIAL_PLATFORM_META[id].label;
                      return (
                        <button
                          key={`${link.platform}-${link.url}`}
                          type="button"
                          onClick={() => openTracked(`social:${link.platform}`, link.url)}
                          className="inline-flex items-center gap-2 rounded-xl border border-border-card bg-[color:var(--surface-card)] pl-3 pr-4 py-2.5 text-sm font-medium text-text-primary hover:bg-[color:var(--surface-muted)] transition"
                        >
                          <SocialPlatformGlyph platform={link.platform} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {profile.qrCodeUrl ? (
                <section className="flex flex-col items-center pt-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Profile QR</h2>
                  <div className="rounded-xl border border-border-subtle bg-white p-2 shadow-sm">
                    <img
                      src={profile.qrCodeUrl}
                      alt=""
                      className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                      width={112}
                      height={112}
                    />
                  </div>
                </section>
              ) : null}
            </div>

            <p className="text-center text-[11px] text-text-muted tracking-wide">
              Powered by{' '}
              <Link href="/" className="font-semibold text-text-secondary hover:text-text-primary transition-colors">
                Jinubify
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCardPage;
