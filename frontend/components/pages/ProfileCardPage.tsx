'use client';

/**
 * Public profile card for /u/:slug (QR landing). Theme-aware; full profile payload; real view counts.
 */

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { FaEnvelope, FaGlobe, FaPhone } from 'react-icons/fa';
import { ConnectionIcon, LinkIcon } from '@/components/icons/Icons';
import {
  normalizeSocialPlatformId,
  SOCIAL_PLATFORM_META,
  SocialPlatformGlyph,
} from '@/lib/socialPlatforms';
import AuthModal from '@/components/AuthModal';
import { publicAPI, userAPI, type PublicProfilePayload } from '../../services/api';
import type { User } from '@/types';

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
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signIn' | 'signUp'>('signUp');

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
  const pageTextClass = isDark ? 'text-white/85' : 'text-slate-800/85';
  const pageMutedTextClass = isDark ? 'text-white/65' : 'text-slate-700/65';
  const cardBottomOverlayClass = isDark
    ? 'bg-gradient-to-t from-black/92 via-black/65 to-transparent border-white/10'
    : 'bg-gradient-to-t from-white/94 via-white/72 to-transparent border-black/10';
  const chipClass = isDark
    ? 'border-white/20 bg-black/45 text-white hover:bg-black/55'
    : 'border-black/15 bg-white/70 text-slate-800 hover:bg-white/85';
  const glassPanelClass = isDark
    ? 'border-white/10 bg-white/5'
    : 'border-black/10 bg-white/55';

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
    if (!currentUser) {
      setShowConnectPrompt(true);
      return;
    }
    // Frontend-only placeholder hook for upcoming backend connect flow.
    void handleConnect();
  }, [currentUser, handleConnect]);

  return (
    <div className={`relative w-full min-h-[100svh] antialiased overflow-hidden ${pageTextClass}`}>
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
              className={`transition-all duration-500 ease-out hover:scale-[1.012] hover:-translate-y-0.5 hover:z-10 motion-reduce:transform-none ${
                cardVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
              }`}
              style={{
                perspective: '1200px',
                width: '100vw',
                marginInline: 'auto',
              }}
            >
              <article
                className="relative h-[100svh] w-full overflow-hidden"
                aria-label={`Profile of ${profile.displayName}`}
              >
                <div className="absolute inset-x-0 top-0 h-[52%] bg-white">
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
                    <div className="flex h-full w-full items-center justify-center bg-white text-5xl font-bold text-zinc-400" aria-hidden>
                      {profile.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div
                  className="pointer-events-none absolute inset-x-0 top-[52%] h-[48%] bg-black"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-x-0 top-[52%] h-[2px] bg-black" aria-hidden />

                <div className="absolute right-4 top-4 z-20 flex items-center gap-2 md:right-6 md:top-6">
                  <button
                    type="button"
                    onClick={handleConnectIconClick}
                    title="Connections"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-xl ${chipClass}`}
                  >
                    <ConnectionIcon className="h-3.5 w-3.5" />
                    {displayedViews.toLocaleString()}
                  </button>
                  <button
                    type="button"
                    title="Links"
                    onClick={() => setIsLinksOpen((v) => !v)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-xl transition ${chipClass}`}
                    aria-expanded={isLinksOpen}
                    aria-label="Open social links"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>

                {isLinksOpen ? (
                  <div
                    className={`absolute right-4 top-14 z-30 w-60 rounded-2xl border p-2 backdrop-blur-xl shadow-2xl ${
                      isDark ? 'border-white/15 bg-black/65' : 'border-black/12 bg-white/75'
                    }`}
                  >
                    {filteredSocialLinks.length === 0 ? (
                      <p className={`px-3 py-2 text-xs ${isDark ? 'text-white/80' : 'text-slate-700/85'}`}>No social links yet.</p>
                    ) : (
                      <ul className="space-y-1">
                        {filteredSocialLinks.map((link) => {
                          const id = normalizeSocialPlatformId(link.platform);
                          if (!id) return null;
                          const meta = SOCIAL_PLATFORM_META[id];
                          const label = meta.label;
                          const BrandIcon = meta.Icon;
                          return (
                            <li key={`${link.platform}-${link.url}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsLinksOpen(false);
                                  openTracked(`social:${link.platform}`, link.url);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                                  isDark ? 'text-white/95 hover:bg-white/10' : 'text-slate-800 hover:bg-black/5'
                                }`}
                              >
                                <BrandIcon
                                  className="h-4 w-4"
                                  style={{ color: meta.color || '#FFFFFF' }}
                                  aria-hidden
                                />
                                <span className="truncate">{label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 top-[47%] flex flex-col justify-end pointer-events-none">
                  <div
                    className={`pointer-events-auto px-5 pb-5 pt-16 sm:px-6 sm:pb-6 md:px-10 md:pb-8 lg:px-14 backdrop-blur-[22px] border-t ${cardBottomOverlayClass}`}
                  >
                    <div className="mx-auto w-full max-w-4xl">
                    <div className="-mt-[3.35rem] mb-3 flex items-center gap-3 md:-mt-[3.85rem] md:gap-4">
                      <div className="shrink-0 rounded-[14px] border-[4px] border-black bg-white p-1.5 shadow-[0_20px_42px_-14px_rgba(0,0,0,0.8)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            avatarImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=random`
                          }
                          alt={`${profile.displayName} avatar`}
                          width={88}
                          height={88}
                          loading="lazy"
                          decoding="async"
                          className="h-[76px] w-[76px] rounded-[10px] border border-black/15 object-cover md:h-[88px] md:w-[88px]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 gap-y-1">
                          <h1 className={`truncate text-2xl sm:text-[1.65rem] md:text-[2.1rem] font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {profile.displayName}
                          </h1>
                          {profile.verified ? <VerifiedAccountBadge isDark={isDark} /> : null}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-white/75' : 'text-slate-700/80'}`}>@{profile.slug}</p>
                      </div>
                    </div>

                    {lead ? (
                      <p className={`mt-2 text-sm sm:text-[15px] md:text-base leading-snug line-clamp-2 ${isDark ? 'text-white/85' : 'text-slate-800/82'}`}>{lead}</p>
                    ) : null}

                    <div className={`mt-4 grid grid-cols-2 gap-2 rounded-2xl border px-3 py-2 ${glassPanelClass}`}>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${pageMutedTextClass}`}>Profile views</p>
                        <p className={`text-sm font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayedViews.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${pageMutedTextClass}`}>Link clicks</p>
                        <p className={`text-sm font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{linkClicksCount.toLocaleString()}</p>
                      </div>
                    </div>

                    {featuredSocialLinks.length > 0 ? (
                      <div
                        className={`mt-4 rounded-2xl border p-3.5 md:p-4 ${
                          isDark
                            ? `${glassPanelClass} md:bg-gradient-to-br md:from-white/[0.11] md:via-white/[0.06] md:to-white/[0.04]`
                            : `${glassPanelClass} md:bg-gradient-to-br md:from-white/95 md:via-white/78 md:to-white/70`
                        }`}
                      >
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${pageMutedTextClass}`}>
                            Social media
                          </p>
                          {currentUser ? (
                            <Link
                              href="/dashboard"
                              className={`text-[11px] font-semibold underline underline-offset-2 transition ${
                                isDark ? 'text-white/85 hover:text-white' : 'text-slate-800 hover:text-slate-950'
                              }`}
                            >
                              My dashboard
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={openSignUpModal}
                              className={`text-[11px] font-semibold underline underline-offset-2 transition ${
                                isDark ? 'text-white/85 hover:text-white' : 'text-slate-800 hover:text-slate-950'
                              }`}
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
                            className={`group inline-flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-[11px] backdrop-blur-md transition ${
                              isDark
                                ? 'border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.16]'
                                : 'border-black/10 bg-white/75 text-slate-800 hover:bg-white/95'
                            }`}
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
                            <span className={`text-[10px] font-semibold transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-white/80' : 'text-slate-700/75'}`}>
                              Visit
                            </span>
                          </button>
                        ))}
                        </div>
                      </div>
                    ) : null}

                    <div className={`mt-4 rounded-2xl border px-3.5 py-3 backdrop-blur-xl ${glassPanelClass}`}>
                      <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${pageMutedTextClass}`}>Contact</p>
                      <ul className="space-y-1.5">
                        {profile.email ? (
                          <li className="flex items-center gap-2 text-xs">
                            <FaEnvelope className={`h-3 w-3 shrink-0 ${pageMutedTextClass}`} aria-hidden />
                            <a
                              href={`mailto:${encodeURIComponent(profile.email)}`}
                              className={`truncate underline-offset-2 hover:underline ${isDark ? 'text-white/90 hover:text-white' : 'text-slate-800 hover:text-slate-950'}`}
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
                            <FaPhone className={`h-3 w-3 shrink-0 ${pageMutedTextClass}`} aria-hidden />
                            <a
                              href={`tel:${profile.phone.replace(/\s/g, '')}`}
                              className={`truncate underline-offset-2 hover:underline ${isDark ? 'text-white/90 hover:text-white' : 'text-slate-800 hover:text-slate-950'}`}
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
                            <FaGlobe className={`h-3 w-3 shrink-0 ${pageMutedTextClass}`} aria-hidden />
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`truncate underline-offset-2 hover:underline ${isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-700 hover:text-blue-800'}`}
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

                    <p className={`mt-3 text-center text-[11px] tracking-wide ${pageMutedTextClass}`}>
                      Powered by{' '}
                      <Link
                        href="/"
                        className={`font-semibold transition-colors ${isDark ? 'text-white/85 hover:text-white' : 'text-slate-800 hover:text-slate-950'}`}
                      >
                        Jinubify
                      </Link>
                    </p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

          </div>
        )}
      </div>
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
