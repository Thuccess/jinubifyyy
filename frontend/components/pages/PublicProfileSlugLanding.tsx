'use client';

/**
 * Standalone public profile landing for /u/:slug (QR scan destination).
 * Self-contained UI + analytics; does not import shared layout chrome from other pages.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaDownload, FaGlobe, FaWhatsapp } from 'react-icons/fa';
import {
  normalizeSocialPlatformId,
  SOCIAL_PLATFORM_META,
  SocialPlatformGlyph,
} from '@/lib/socialPlatforms';
import { publicAPI, type PublicProfilePayload } from '../../services/api';

function whatsappDigits(phone: string): string {
  return String(phone || '').replace(/\D/g, '');
}

function vcardEscape(value: string): string {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;');
}

function platformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return FaLinkedin;
  if (p.includes('instagram')) return FaInstagram;
  if (p.includes('twitter') || p === 'x') return FaTwitter;
  if (p.includes('facebook')) return FaFacebook;
  if (p.includes('youtube')) return FaYoutube;
  if (p.includes('tiktok')) return FaTiktok;
  if (p.includes('github')) return FaGithub;
  if (p.includes('whatsapp')) return FaWhatsapp;
  return FaGlobe;
}

function labelForPlatform(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return 'LinkedIn';
  if (p.includes('instagram')) return 'Instagram';
  if (p.includes('twitter') || p === 'x') return p === 'x' ? 'X' : 'Twitter';
  if (p.includes('facebook')) return 'Facebook';
  if (p.includes('youtube')) return 'YouTube';
  if (p.includes('tiktok')) return 'TikTok';
  if (p.includes('github')) return 'GitHub';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

const PublicProfileSlugLanding: React.FC = () => {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [profile, setProfile] = useState<PublicProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const waLink = useMemo(() => {
    if (!profile?.phone) return '';
    const d = whatsappDigits(profile.phone);
    return d ? `https://wa.me/${d}` : '';
  }, [profile?.phone]);

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
      setLoading(false);
      setError('Invalid profile link.');
      return;
    }
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await publicAPI.getProfileBySlug(slug);
        if (!active) return;
        setProfile(res.profile);
      } catch {
        if (!active) return;
        setProfile(null);
        setError('This profile is not available.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!profile || !slug) return;
    if (typeof window === 'undefined') return;
    const key = `jinubify-public-profile-view:${slug}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
    void publicAPI.trackProfileView(slug);
  }, [profile, slug]);

  const buildVcard = useCallback((): string => {
    if (!profile) return '';
    const org = profile.accountType === 'business' && profile.company ? profile.company : '';
    const title = profile.tagline || '';
    const note = profile.about || '';
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${vcardEscape(profile.displayName)}`];
    if (org) lines.push(`ORG:${vcardEscape(org)}`);
    if (title) lines.push(`TITLE:${vcardEscape(title)}`);
    if (note) lines.push(`NOTE:${vcardEscape(note)}`);
    if (profile.phone) lines.push(`TEL;TYPE=CELL:${vcardEscape(profile.phone)}`);
    if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${vcardEscape(profile.email)}`);
    if (profile.website) lines.push(`URL:${vcardEscape(profile.website)}`);
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }, [profile]);

  const handleSaveContact = useCallback(() => {
    if (!profile || !slug) return;
    track('vcf');
    const blob = new Blob([buildVcard()], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [profile, slug, buildVcard, track]);

  if (!slug) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-text-primary antialiased">
      <div className="max-w-md mx-auto px-4 pb-12 sm:pb-16">
        {/* Hero */}
        <header className="pt-6 sm:pt-10 text-center">
          <Link
            href="/"
            className="inline-flex text-xs font-medium text-text-muted hover:text-text-primary mb-8"
          >
            ← Jinubify
          </Link>

          {loading && (
            <div className="rounded-3xl border border-border-subtle bg-[color:var(--surface-card)] p-12 animate-pulse">
              <div className="h-28 w-28 rounded-full bg-surface-muted mx-auto" />
              <div className="h-6 w-3/4 max-w-[200px] bg-surface-muted rounded mx-auto mt-6" />
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="rounded-2xl border border-border-strong bg-surface-muted px-5 py-10 text-sm text-text-secondary"
            >
              {error}
            </div>
          )}

          {!loading && profile && (
            <>
              <div className="relative mx-auto w-[120px] sm:w-[132px]">
                <div
                  className={`overflow-hidden bg-surface-muted ring-2 ring-border-card shadow-lg ${
                    profile.accountType === 'business'
                      ? 'rounded-2xl aspect-square'
                      : 'rounded-full aspect-square'
                  }`}
                >
                  {profile.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary user/brand URLs
                    <img
                      src={profile.heroImageUrl}
                      alt=""
                      width={132}
                      height={132}
                      className="h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl text-text-muted font-semibold">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {profile.verified && (
                  <span
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-[color:var(--bg-primary)]"
                    title="Verified on Jinubify"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>

              <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary px-2">
                {profile.displayName}
              </h1>
              {profile.username ? (
                <p className="mt-1 text-sm text-text-muted font-medium">@{profile.username}</p>
              ) : null}
              {profile.tagline ? (
                <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed max-w-sm mx-auto px-2">
                  {profile.tagline}
                </p>
              ) : null}
            </>
          )}
        </header>

        {!loading && profile && (
          <>
            {/* Primary actions */}
            <section className="mt-10 space-y-3" aria-label="Actions">
              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-semibold bg-brand-primary text-text-inverted shadow-sm hover:opacity-95 active:scale-[0.99] transition"
              >
                <FaDownload className="h-4 w-4 opacity-90" aria-hidden />
                Save Contact
              </button>
              <div className={`grid gap-3 ${profile.website && waLink ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {waLink ? (
                  <button
                    type="button"
                    onClick={() => openTracked('whatsapp', waLink)}
                    className="flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-semibold border border-border-card bg-[color:var(--surface-card)] text-text-primary hover:bg-surface-muted/80 transition"
                  >
                    <FaWhatsapp className="h-5 w-5 text-emerald-600" aria-hidden />
                    WhatsApp
                  </button>
                ) : null}
                {profile.website ? (
                  <button
                    type="button"
                    onClick={() => openTracked('website', profile.website)}
                    className="flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-semibold border border-border-card bg-[color:var(--surface-card)] text-text-primary hover:bg-surface-muted/80 transition"
                  >
                    <FaGlobe className="h-4 w-4 text-text-secondary" aria-hidden />
                    Website
                  </button>
                ) : null}
              </div>
            </section>

            {/* Social */}
            {profile.socialLinks && profile.socialLinks.length > 0 ? (
              <section className="mt-10" aria-label="Social links">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Connect
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {profile.socialLinks.map((link) => {
                    const id = normalizeSocialPlatformId(link.platform);
                    if (!id) return null;
                    const label = SOCIAL_PLATFORM_META[id].label;
                    return (
                      <button
                        key={`${link.platform}-${link.url}`}
                        type="button"
                        onClick={() => openTracked(`social:${link.platform}`, link.url)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border-card bg-[color:var(--surface-card)] pl-3 pr-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-muted/80 transition"
                      >
                        <SocialPlatformGlyph platform={link.platform} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {/* About */}
            {profile.about ? (
              <section className="mt-10" aria-label="About">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  About
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                  {profile.about}
                </p>
              </section>
            ) : null}

            {/* Contact */}
            <section className="mt-10 rounded-2xl border border-border-subtle bg-[color:var(--surface-card)] p-5 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                Contact
              </h2>
              <ul className="space-y-3 text-sm">
                {profile.email ? (
                  <li>
                    <a
                      href={`mailto:${encodeURIComponent(profile.email)}`}
                      onClick={() => track('mail')}
                      className="text-brand-primary font-medium hover:underline break-all"
                    >
                      {profile.email}
                    </a>
                  </li>
                ) : null}
                {profile.phone ? (
                  <li>
                    <a
                      href={`tel:${profile.phone.replace(/\s/g, '')}`}
                      onClick={() => track('phone')}
                      className="text-text-primary font-medium hover:underline"
                    >
                      {profile.phone}
                    </a>
                  </li>
                ) : null}
                {profile.website ? (
                  <li>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('website_inline')}
                      className="text-brand-primary font-medium hover:underline break-all"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                ) : null}
                {!profile.email && !profile.phone && !profile.website ? (
                  <li className="text-text-muted text-sm">No contact details shared.</li>
                ) : null}
              </ul>
            </section>

            {/* Footer */}
            <footer className="mt-12 flex flex-col items-center gap-4 text-center">
              {profile.qrCodeUrl ? (
                <div className="rounded-xl border border-border-subtle bg-white p-2 shadow-sm">
                  <img
                    src={profile.qrCodeUrl}
                    alt=""
                    className="h-[72px] w-[72px] sm:h-20 sm:w-20 object-contain"
                    width={80}
                    height={80}
                  />
                </div>
              ) : null}
              <p className="text-xs text-text-muted">
                Powered by{' '}
                <Link href="/" className="font-semibold text-text-secondary hover:text-text-primary">
                  Jinubify
                </Link>
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicProfileSlugLanding;
