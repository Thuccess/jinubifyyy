'use client';

/**
 * Public profile card for /u/:slug (QR landing). Theme-aware; full profile payload; real view counts.
 */

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { FaEnvelope, FaGlobe, FaImages, FaPhone } from 'react-icons/fa';
import { LinkIcon } from '@/components/icons/Icons';
import {
  normalizeSocialPlatformId,
  SOCIAL_PLATFORM_META,
  SocialPlatformGlyph,
} from '@/lib/socialPlatforms';
import AuthModal from '@/components/AuthModal';
import { publicAPI, userAPI, type PublicProfilePayload } from '../../services/api';
import type { User } from '@/types';
import { rgbaFromHex, textLuminance } from '@/lib/publicProfileTheme';

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
  const { currentUser, login } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [state, setState] = useState<LoadState>('loading');
  const [profile, setProfile] = useState<PublicProfilePayload | null>(null);
  const [displayedViews, setDisplayedViews] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signIn' | 'signUp'>('signUp');
  const [actionNote, setActionNote] = useState<string | null>(null);

  const openSignUpModal = useCallback(() => {
    setAuthModalView('signUp');
    setAuthModalOpen(true);
  }, []);

  const openSignInModal = useCallback(() => {
    setAuthModalView('signIn');
    setAuthModalOpen(true);
  }, []);
  const [linkClicksCount, setLinkClicksCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const coverImage = profile?.heroImageUrl || profile?.photoURL || '';
  const avatarImage = profile?.photoURL || profile?.heroImageUrl || '';
  const filteredSocialLinks = useMemo(() => {
    if (!profile?.socialLinks) return [];
    const allowed = new Set([
      'facebook',
      'instagram',
      'youtube',
      'tiktok',
      'whatsapp',
      'messenger',
      'x',
      'twitter',
      'snapchat',
      'linkedin',
      'pinterest',
      'reddit',
      'threads',
      'telegram',
      'wechat',
      'website',
    ]);
    return profile.socialLinks.filter((l) => allowed.has(String(l.platform || '').toLowerCase()));
  }, [profile?.socialLinks]);
  const featuredSocialLinks = useMemo(() => filteredSocialLinks.slice(0, 8), [filteredSocialLinks]);

  /** One server-backed link click; bumps local count only after the event is stored. */
  const recordLinkClick = useCallback(async (target: string): Promise<void> => {
    if (!slug) return;
    const ok = await publicAPI.trackProfileClick(slug, target);
    if (ok) setLinkClicksCount((n) => n + 1);
  }, [slug]);

  const openTracked = useCallback(
    (target: string, href: string) => {
      void recordLinkClick(target);
      window.open(href, '_blank', 'noopener,noreferrer');
    },
    [recordLinkClick],
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
        setLinkClicksCount(Number(res.profile.linkClickCount) || 0);
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
    const fromQr = searchParams?.get('ref') === 'qr';
    void (async () => {
      const ok = await publicAPI.trackProfileView(slug, fromQr ? { ref: 'qr' } : undefined);
      if (ok) setDisplayedViews((v) => v + 1);
    })();
  }, [slug, state, profile, searchParams]);

  useEffect(() => {
    if (state !== 'ready') return;
    const t = window.requestAnimationFrame(() => setCardVisible(true));
    return () => window.cancelAnimationFrame(t);
  }, [state]);

  const isDark = theme === 'dark';
  const lead = profile ? heroLead(profile) : '';
  const bioText = profile?.about?.trim() || '';
  const professionalTitle = profile?.professionalTitle?.trim() || '';
  const skillsExpertise = (profile?.skillsExpertise || []).filter(Boolean);
  const workExperience = (profile?.workExperience || []).filter(Boolean);
  const educationCertifications = (profile?.educationCertifications || []).filter(Boolean);
  const achievementsProjects = (profile?.achievementsProjects || []).filter(Boolean);
  const personalInterests = (profile?.personalInterests || []).filter(Boolean);
  const galleryImages = (profile?.galleryImages || []).filter(Boolean).slice(0, 4);
  const accentColor = profile?.brandGuidelines?.publicProfileAccentColor?.trim() ?? '';
  const textColor = profile?.brandGuidelines?.publicProfileTextColor?.trim() ?? '';
  const usePublicProfileColors = Boolean(accentColor || textColor);
  const textLum = textColor ? textLuminance(textColor) : null;
  const badgeIsDark = textLum != null ? textLum > 0.45 : isDark;

  const pageTextClass = isDark ? 'text-white/85' : 'text-slate-800/85';
  const pageMutedTextClass = isDark ? 'text-white/65' : 'text-slate-700/65';
  const cardBottomOverlayClass = isDark
    ? 'bg-gradient-to-t from-black/92 via-black/65 to-transparent border-white/10'
    : 'bg-gradient-to-t from-white/94 via-white/72 to-transparent border-black/10';
  const chipClass =
    accentColor || textColor
      ? 'border text-[color:var(--pp-text)] backdrop-blur-xl hover:opacity-95'
      : isDark
        ? 'border-white/20 bg-black/45 text-white hover:bg-black/55'
        : 'border-black/15 bg-white/70 text-slate-800 hover:bg-white/85';
  const chipSurfaceStyle: React.CSSProperties = {};
  if (accentColor) {
    chipSurfaceStyle.borderColor = rgbaFromHex(accentColor, 0.42);
    chipSurfaceStyle.backgroundColor = rgbaFromHex(accentColor, 0.12);
  }
  if (textColor) {
    chipSurfaceStyle.color = textColor;
    if (!accentColor) {
      chipSurfaceStyle.borderColor = rgbaFromHex(textColor, 0.38);
      chipSurfaceStyle.backgroundColor = rgbaFromHex(textColor, 0.1);
    }
  }
  const glassPanelClass =
    accentColor || textColor
      ? 'border backdrop-blur-md'
      : isDark
        ? 'border-white/10 bg-white/5'
        : 'border-black/10 bg-white/55';
  const glassPanelStyle: React.CSSProperties =
    accentColor
      ? {
          borderColor: rgbaFromHex(accentColor, 0.28),
          backgroundColor: rgbaFromHex(accentColor, 0.07),
        }
      : textColor
        ? {
            borderColor: rgbaFromHex(textColor, 0.22),
            backgroundColor: rgbaFromHex(textColor, 0.06),
          }
        : {};
  const headingTextClass = textColor
    ? 'text-[color:var(--pp-text)]'
    : isDark
      ? 'text-white'
      : 'text-slate-900';
  const subheadingMutedClass = textColor
    ? 'text-[color:var(--pp-muted)]'
    : isDark
      ? 'text-white/75'
      : 'text-slate-700/80';
  const bodyLeadClass = textColor
    ? 'text-[color:var(--pp-text)]'
    : isDark
      ? 'text-white/85'
      : 'text-slate-800/82';
  const statsLabelClass = textColor ? 'text-[color:var(--pp-muted)]' : pageMutedTextClass;
  const statsValueClass = headingTextClass;
  const linkLikeClass = accentColor
    ? 'text-[color:var(--pp-accent)] hover:opacity-90'
    : textColor
      ? 'text-[color:var(--pp-text)] hover:opacity-90'
      : isDark
        ? 'text-white/85 hover:text-white'
        : 'text-slate-800 hover:text-slate-950';
  const contactLinkClass = accentColor
    ? 'text-[color:var(--pp-accent)] hover:opacity-90 underline-offset-2 hover:underline'
    : textColor
      ? 'text-[color:var(--pp-text)] hover:opacity-90 underline-offset-2 hover:underline'
      : isDark
        ? 'text-white/90 hover:text-white'
        : 'text-slate-800 hover:text-slate-950';
  const websiteLinkClass = accentColor
    ? 'text-[color:var(--pp-accent)] hover:opacity-90 underline-offset-2 hover:underline'
    : textColor
      ? 'text-[color:var(--pp-text)] hover:opacity-90 underline-offset-2 hover:underline'
      : isDark
        ? 'text-cyan-300 hover:text-cyan-200'
        : 'text-blue-700 hover:text-blue-800';
  const socialPillClass =
    accentColor || textColor
      ? 'border text-[color:var(--pp-text)] backdrop-blur-md transition hover:opacity-95'
      : isDark
        ? 'border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.16]'
        : 'border-black/10 bg-white/75 text-slate-800 hover:bg-white/95';
  const socialPillStyle: React.CSSProperties = {};
  if (accentColor) {
    socialPillStyle.borderColor = rgbaFromHex(accentColor, 0.35);
    socialPillStyle.backgroundColor = rgbaFromHex(accentColor, 0.08);
  } else if (textColor) {
    socialPillStyle.borderColor = rgbaFromHex(textColor, 0.32);
    socialPillStyle.backgroundColor = rgbaFromHex(textColor, 0.08);
  }
  const socialPillChevronClass = textColor
    ? 'text-[color:var(--pp-muted)]'
    : isDark
      ? 'text-white/80'
      : 'text-slate-700/75';
  const poweredByClass = textColor ? 'text-[color:var(--pp-muted)]' : pageMutedTextClass;
  const poweredByLinkClass = accentColor
    ? 'font-semibold text-[color:var(--pp-accent)] hover:opacity-90'
    : textColor
      ? 'font-semibold text-[color:var(--pp-text)] hover:opacity-90'
      : isDark
        ? 'font-semibold text-white/85 hover:text-white'
        : 'font-semibold text-slate-800 hover:text-slate-950';

  const articleProfileColorStyle: React.CSSProperties | undefined = usePublicProfileColors
    ? ({
        '--pp-text': textColor
          ? textColor
          : isDark
            ? 'rgba(255,255,255,0.92)'
            : 'rgb(15 23 42)',
        '--pp-muted': textColor
          ? rgbaFromHex(textColor, 0.72) || 'rgba(148,163,184,0.85)'
          : isDark
            ? 'rgba(255,255,255,0.65)'
            : 'rgba(51,65,85,0.78)',
        '--pp-accent': accentColor || (isDark ? '#93c5fd' : '#4f46e5'),
      } as React.CSSProperties)
    : undefined;

  useEffect(() => {
    if (!currentUser || !profile?.userId) {
      setIsConnected(false);
      return;
    }
    let alive = true;
    void (async () => {
      try {
        const r = await userAPI.getConnections();
        if (!alive) return;
        const list = r.connections || [];
        setIsConnected(list.some((c) => c._id === profile.userId));
      } catch {
        if (!alive) return;
        setIsConnected(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentUser, profile?.userId]);

  const handleConnect = useCallback(async () => {
    if (!currentUser?._id || !profile?.userId || isConnecting || isConnected) return;
    setIsConnecting(true);
    setIsConnected(true);
    try {
      await userAPI.connectToUser(profile.userId);
    } catch {
      setIsConnected(false);
    } finally {
      window.setTimeout(() => setIsConnecting(false), 350);
    }
  }, [currentUser?._id, isConnected, isConnecting, profile?.userId]);

  const handleConnectIconClick = useCallback(() => {
    const hasAuthToken =
      typeof window !== 'undefined' &&
      Boolean(window.localStorage.getItem('token') || window.sessionStorage.getItem('token'));
    if (!hasAuthToken || !currentUser?._id) {
      setShowConnectPrompt(false);
      setActionNote(null);
      openSignUpModal();
      return;
    }
    if (currentUser._id === profile?.userId) {
      setActionNote('This is your profile.');
      return;
    }
    if (isConnected) {
      setActionNote('Already connected.');
      return;
    }
    if (isConnecting) return;
    setActionNote(null);
    // Frontend-only placeholder hook for upcoming backend connect flow.
    void handleConnect();
  }, [currentUser, handleConnect, isConnected, isConnecting, openSignUpModal, profile?.userId]);

  useEffect(() => {
    if (!actionNote) return;
    const t = window.setTimeout(() => setActionNote(null), 1800);
    return () => window.clearTimeout(t);
  }, [actionNote]);

  useEffect(() => {
    if (activeGalleryIndex == null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveGalleryIndex(null);
      if (e.key === 'ArrowRight' && galleryImages.length > 0) {
        setActiveGalleryIndex((idx) => ((idx ?? 0) + 1) % galleryImages.length);
      }
      if (e.key === 'ArrowLeft' && galleryImages.length > 0) {
        setActiveGalleryIndex((idx) => ((idx ?? 0) - 1 + galleryImages.length) % galleryImages.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeGalleryIndex, galleryImages.length]);

  return (
    <div className={`relative w-full min-h-[100svh] antialiased overflow-x-hidden scroll-smooth ${pageTextClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-transparent" />

      <div className="relative min-h-[100svh] flex flex-col items-center justify-center">
        {state === 'loading' && (
          <div
            className={`h-[100svh] w-full overflow-hidden animate-pulse ${
              isDark ? 'bg-black/35' : 'bg-white/45'
            }`}
            aria-busy="true"
            aria-label="Loading profile"
          >
            <div className={`h-full w-full ${isDark ? 'bg-gradient-to-t from-black/60 to-transparent' : 'bg-gradient-to-t from-white/65 to-transparent'} opacity-70`} />
          </div>
        )}

        {state === 'error' && (
          <div
            className={`h-[100svh] w-full px-8 py-14 text-center text-sm flex items-center justify-center ${
              isDark ? 'bg-black/45 text-white/80' : 'bg-white/70 text-slate-700'
            }`}
            role="alert"
          >
            This profile isn&apos;t available.
          </div>
        )}

        {state === 'ready' && profile && (
          <div className="w-full">
            <div
              className={`transition-opacity duration-500 ease-out ${cardVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{
                perspective: '1200px',
                width: '100vw',
                marginInline: 'auto',
              }}
            >
              <article
                className="relative min-h-[100svh] w-full"
                style={articleProfileColorStyle}
                aria-label={`Profile of ${profile.displayName}`}
              >
                <section className="relative w-full min-h-[140px] h-36 overflow-hidden bg-white sm:min-h-[168px] sm:h-44 md:min-h-[196px] md:h-52 lg:min-h-[224px] lg:h-60">
                  {coverImage && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote user media
                    <img
                      src={coverImage}
                      alt=""
                      width={760}
                      height={430}
                      className={`h-full w-full object-cover transition-opacity duration-700 ease-out ${
                        imgLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                      decoding="async"
                      onLoad={() => setImgLoaded(true)}
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white text-3xl font-bold text-zinc-400 sm:text-4xl md:text-5xl" aria-hidden>
                      {profile.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/20 to-transparent sm:h-16 md:h-20"
                    aria-hidden
                  />
                </section>

                <div className="border-t border-black bg-black">
                  <div className="mx-auto flex w-full max-w-4xl justify-start px-4 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-3 md:px-10 md:pt-5 md:pb-4 lg:px-14">
                    <div className="ring-[3px] ring-white sm:ring-4 md:ring-[5px] rounded-full shadow-[0_12px_28px_-8px_rgba(0,0,0,0.55)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          avatarImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random`
                        }
                        alt={`${profile.displayName} avatar`}
                        width={112}
                        height={112}
                        loading="lazy"
                        decoding="async"
                        className="h-16 w-16 rounded-full border border-black/10 object-cover sm:h-[4.5rem] sm:w-[4.5rem] md:h-24 md:w-24 lg:h-28 lg:w-28"
                      />
                    </div>
                  </div>
                </div>

                <section className="border-t border-black bg-black">
                  <div
                    className={`mx-auto w-full max-w-4xl px-4 pb-5 pt-2 sm:px-6 sm:pb-6 sm:pt-3 md:px-10 md:pb-8 md:pt-4 lg:px-14 backdrop-blur-[22px] ${cardBottomOverlayClass}`}
                  >
                    <div>
                      <div className="flex flex-col items-stretch">
                        <div className="min-w-0 w-full">
                          <div
                            className={`sticky top-0 z-20 -mx-1 mb-2 rounded-xl border px-3 py-2.5 backdrop-blur-xl sm:-mx-2 sm:px-4 ${
                              accentColor || textColor
                                ? glassPanelClass
                                : isDark
                                  ? 'border-white/20 bg-black/62'
                                  : 'border-black/15 bg-white/78'
                            }`}
                            style={accentColor || textColor ? glassPanelStyle : undefined}
                          >
                            <div className="flex flex-wrap items-center gap-2 gap-y-1">
                              <h1
                                className={`truncate text-[1.3rem] sm:text-[1.45rem] md:text-[1.7rem] font-bold tracking-tight leading-tight ${headingTextClass}`}
                              >
                                {profile.displayName}
                              </h1>
                              {profile.verified ? <VerifiedAccountBadge isDark={badgeIsDark} /> : null}
                            </div>
                            <p className={`text-sm ${subheadingMutedClass}`}>@{profile.slug}</p>
                          </div>
                          {professionalTitle ? (
                            <p className={`mt-0.5 text-xs sm:text-sm ${subheadingMutedClass}`}>{professionalTitle}</p>
                          ) : null}
                          {lead ? (
                            <p className={`mt-2 text-sm sm:text-[15px] md:text-base leading-snug line-clamp-2 ${bodyLeadClass}`}>
                              {lead}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className={`mt-4 border-t pt-3.5 sm:pt-4 ${isDark ? 'border-white/12' : 'border-black/12'}`}>
                    <div
                      className={`mt-3.5 grid grid-cols-2 gap-2 rounded-2xl border px-3 py-2 ${glassPanelClass}`}
                      style={accentColor || textColor ? glassPanelStyle : undefined}
                    >
                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${statsLabelClass}`}>Profile views</p>
                        <p className={`text-sm font-semibold tabular-nums ${statsValueClass}`}>
                          {displayedViews.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${statsLabelClass}`}>Link clicks</p>
                        <p className={`text-sm font-semibold tabular-nums ${statsValueClass}`}>
                          {linkClicksCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleConnectIconClick}
                        title="Connections"
                        style={accentColor || textColor ? chipSurfaceStyle : undefined}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-xl ${chipClass}`}
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Connect
                      </button>
                      <button
                        type="button"
                        title="Gallery"
                        onClick={() => {
                          if (galleryImages.length > 0) {
                            setActiveGalleryIndex(0);
                          } else {
                            setActionNote('No gallery images yet.');
                          }
                        }}
                        style={accentColor || textColor ? chipSurfaceStyle : undefined}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-xl ${chipClass}`}
                        aria-label="Open gallery"
                      >
                        <FaImages className="h-3.5 w-3.5" />
                        Gallery
                      </button>
                    </div>
                    {actionNote ? (
                      <p className={`mt-2 text-xs ${statsLabelClass}`}>{actionNote}</p>
                    ) : null}

                    {galleryImages.length > 0 ? (
                      <div
                        className={`mt-4 rounded-2xl border p-3.5 md:p-4 ${glassPanelClass}`}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                      >
                        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${statsLabelClass}`}>
                          Gallery
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {galleryImages.map((img, index) => (
                            <button
                              key={`gallery-${index}-${img}`}
                              type="button"
                              onClick={() => setActiveGalleryIndex(index)}
                              className="overflow-hidden rounded-xl border border-black/15"
                              aria-label={`Open gallery image ${index + 1}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt={`${profile.displayName} gallery image ${index + 1}`}
                                className="h-32 w-full object-cover transition hover:scale-[1.02]"
                                loading="lazy"
                                decoding="async"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {bioText ? (
                      <div
                        className={`mt-4 rounded-2xl border p-3.5 md:p-4 ${glassPanelClass}`}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                      >
                        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${statsLabelClass}`}>
                          Bio
                        </p>
                        <p className={`text-xs sm:text-sm leading-relaxed ${bodyLeadClass}`}>{bioText}</p>
                      </div>
                    ) : null}

                    {featuredSocialLinks.length > 0 ? (
                      <div
                        className={`mt-4 rounded-2xl border p-3.5 md:p-4 ${
                          accentColor || textColor
                            ? glassPanelClass
                            : isDark
                              ? `${glassPanelClass} md:bg-gradient-to-br md:from-white/[0.11] md:via-white/[0.06] md:to-white/[0.04]`
                              : `${glassPanelClass} md:bg-gradient-to-br md:from-white/95 md:via-white/78 md:to-white/70`
                        }`}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                      >
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${statsLabelClass}`}>
                            Social media
                          </p>
                          {currentUser ? (
                            <Link
                              href="/dashboard"
                              className={`text-[11px] font-semibold underline underline-offset-2 transition ${linkLikeClass}`}
                            >
                              My dashboard
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={openSignUpModal}
                              className={`text-[11px] font-semibold underline underline-offset-2 transition ${linkLikeClass}`}
                            >
                              Create account for free
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                        {featuredSocialLinks.map((link) => (
                          <button
                            key={`pill-${link.platform}-${link.url}`}
                            type="button"
                            onClick={() => openTracked(`social:${link.platform}`, link.url)}
                            style={accentColor || textColor ? socialPillStyle : undefined}
                            className={`group inline-flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-[11px] backdrop-blur-md transition ${socialPillClass}`}
                          >
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                            {(() => {
                              const id = normalizeSocialPlatformId(link.platform);
                              if (!id) return null;
                              const meta = SOCIAL_PLATFORM_META[id];
                              const BrandIcon = meta.Icon;
                              return (
                                <BrandIcon
                                  className="h-3.5 w-3.5"
                                  style={{ color: meta.color || '#FFFFFF' }}
                                  aria-hidden
                                />
                              );
                            })()}
                            <span className="truncate capitalize">{link.platform}</span>
                            </span>
                            <span
                              className={`text-[10px] font-semibold transition-transform group-hover:translate-x-0.5 ${socialPillChevronClass}`}
                            >
                              Visit
                            </span>
                          </button>
                        ))}
                        </div>
                      </div>
                    ) : null}

                    {skillsExpertise.length > 0 ? (
                      <div
                        className={`mt-4 rounded-2xl border p-3.5 md:p-4 ${glassPanelClass}`}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                      >
                        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${statsLabelClass}`}>
                          Skills & expertise
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {skillsExpertise.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              style={accentColor || textColor ? socialPillStyle : undefined}
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${socialPillClass}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {workExperience.length > 0 ? (
                      <InfoListBlock
                        title="Work experience"
                        items={workExperience}
                        isDark={isDark}
                        className={glassPanelClass}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                        labelClass={statsLabelClass}
                        textClass={bodyLeadClass}
                      />
                    ) : null}

                    {educationCertifications.length > 0 ? (
                      <InfoListBlock
                        title="Education & certifications"
                        items={educationCertifications}
                        isDark={isDark}
                        className={glassPanelClass}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                        labelClass={statsLabelClass}
                        textClass={bodyLeadClass}
                      />
                    ) : null}

                    {achievementsProjects.length > 0 ? (
                      <InfoListBlock
                        title="Achievements & notable projects"
                        items={achievementsProjects}
                        isDark={isDark}
                        className={glassPanelClass}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                        labelClass={statsLabelClass}
                        textClass={bodyLeadClass}
                      />
                    ) : null}

                    {personalInterests.length > 0 ? (
                      <div
                        className={`mt-4 rounded-2xl border p-3.5 md:p-4 ${glassPanelClass}`}
                        style={accentColor || textColor ? glassPanelStyle : undefined}
                      >
                        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${statsLabelClass}`}>
                          Personal interests
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {personalInterests.map((interest, index) => (
                            <span
                              key={`${interest}-${index}`}
                              style={accentColor || textColor ? socialPillStyle : undefined}
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${socialPillClass}`}
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div
                      className={`mt-4 rounded-2xl border px-3 py-3 backdrop-blur-xl sm:px-3.5 ${glassPanelClass}`}
                      style={accentColor || textColor ? glassPanelStyle : undefined}
                    >
                      <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${statsLabelClass}`}>
                        Contact
                      </p>
                      <ul className="space-y-1.5">
                        {profile.email ? (
                          <li className="flex items-center gap-2 text-xs">
                            <FaEnvelope className={`h-3 w-3 shrink-0 ${statsLabelClass}`} aria-hidden />
                            <a
                              href={`mailto:${encodeURIComponent(profile.email)}`}
                              className={`truncate underline-offset-2 hover:underline ${contactLinkClass}`}
                              onClick={(e) => {
                                e.preventDefault();
                                void (async () => {
                                  await recordLinkClick('mail');
                                  window.location.assign(`mailto:${encodeURIComponent(profile.email)}`);
                                })();
                              }}
                            >
                              {profile.email}
                            </a>
                          </li>
                        ) : null}
                        {profile.phone ? (
                          <li className="flex items-center gap-2 text-xs">
                            <FaPhone className={`h-3 w-3 shrink-0 ${statsLabelClass}`} aria-hidden />
                            <a
                              href={`tel:${profile.phone.replace(/\s/g, '')}`}
                              className={`truncate underline-offset-2 hover:underline ${contactLinkClass}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const tel = `tel:${profile.phone.replace(/\s/g, '')}`;
                                void (async () => {
                                  await recordLinkClick('phone');
                                  window.location.assign(tel);
                                })();
                              }}
                            >
                              {profile.phone}
                            </a>
                          </li>
                        ) : null}
                        {profile.website ? (
                          <li className={`flex items-center gap-2 text-xs pt-1.5 ${isDark ? 'border-t border-white/10' : 'border-t border-black/10'}`}>
                            <FaGlobe className={`h-3 w-3 shrink-0 ${statsLabelClass}`} aria-hidden />
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`truncate underline-offset-2 hover:underline ${websiteLinkClass}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const w = profile.website;
                                void (async () => {
                                  await recordLinkClick('website');
                                  window.open(w, '_blank', 'noopener,noreferrer');
                                })();
                              }}
                            >
                              {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                          </li>
                        ) : null}
                      </ul>
                    </div>

                    <p className={`mt-3 text-center text-[11px] tracking-wide ${poweredByClass}`}>
                      Powered by{' '}
                      <Link href="/" className={`transition-colors ${poweredByLinkClass}`}>
                        Jinubify
                      </Link>
                    </p>
                    </div>
                  </div>
                </section>
              </article>
            </div>

          </div>
        )}
      </div>
      {activeGalleryIndex != null && galleryImages[activeGalleryIndex] ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close gallery image"
            onClick={() => setActiveGalleryIndex(null)}
          />
          <div className="relative z-10 w-full max-w-3xl">
            {galleryImages.length > 1 ? (
              <button
                type="button"
                onClick={() =>
                  setActiveGalleryIndex((idx) => ((idx ?? 0) - 1 + galleryImages.length) % galleryImages.length)
                }
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white"
                aria-label="Previous image"
              >
                Prev
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveGalleryIndex(null)}
              className="absolute right-2 top-2 z-20 rounded-full bg-black/60 px-3 py-1 text-sm text-white"
              aria-label="Close"
            >
              Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[activeGalleryIndex]}
              alt={`${profile?.displayName || 'Profile'} gallery view ${activeGalleryIndex + 1}`}
              className="max-h-[85vh] w-full rounded-2xl object-contain transition-opacity duration-200"
            />
            {galleryImages.length > 1 ? (
              <button
                type="button"
                onClick={() => setActiveGalleryIndex((idx) => ((idx ?? 0) + 1) % galleryImages.length)}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white"
                aria-label="Next image"
              >
                Next
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {showConnectPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-white/35'}`}
            aria-label="Close sign in prompt"
            onClick={() => setShowConnectPrompt(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl backdrop-blur-xl ${
              isDark ? 'border-white/15 bg-black/70 text-white' : 'border-black/12 bg-white/82 text-slate-900'
            }`}
          >
            <h3 className="text-base font-semibold">Sign in to connect</h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              Create your account for free or sign in to join the Jinubify community.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowConnectPrompt(false)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  isDark ? 'border-white/20 text-white' : 'border-black/15 text-slate-900'
                }`}
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConnectPrompt(false);
                  openSignInModal();
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold ${
                  isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConnectPrompt(false);
                  openSignUpModal();
                }}
                className={`sm:col-span-2 rounded-lg border px-3 py-2 text-center text-sm font-semibold transition ${
                  isDark
                    ? 'border-white/25 bg-white/10 text-white hover:bg-white/15'
                    : 'border-black/15 bg-white/80 text-slate-900 hover:bg-white'
                }`}
              >
                Create account for free
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        view={authModalView}
        onSuccess={(user: User) => {
          login(user);
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProfileCardPage;

function InfoListBlock({
  title,
  items,
  isDark,
  className,
  style,
  labelClass,
  textClass,
}: {
  title: string;
  items: string[];
  isDark: boolean;
  className: string;
  style?: React.CSSProperties;
  labelClass: string;
  textClass: string;
}) {
  return (
    <div className={`mt-4 rounded-2xl border p-3.5 md:p-4 ${className}`} style={style}>
      <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${labelClass}`}>{title}</p>
      <ul className={`space-y-1.5 text-xs sm:text-sm ${textClass}`}>
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className={`flex gap-2 ${isDark ? 'text-white/85' : 'text-slate-800/85'}`}>
            <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
