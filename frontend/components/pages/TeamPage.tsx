'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from '@/components/NextImage';
import { TwitterIcon, LinkedInIcon, GlobeIcon } from '../icons/Socials';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import Icon from '../ui/Icon';
import { teamAPI } from '../../services/api';
import type { TeamPagePayload, TeamMemberPayload, CeoFounderPayload } from '../../services/api';
import { teamMembers as fallbackMembers } from '../data/teamData';
import { normalizeImageUrl } from '../../utils/image';
import { Skeleton } from '../ui/skeleton';

const defaultHero = {
  eyebrow: 'Our Team',
  heading: 'Meet the People Behind Jinubify',
  subtitle:
    'We are a passionate team of innovators, creators, and problem-solvers dedicated to building innovative tech and creative solutions that drive success.',
};
const defaultStripHeading = 'Browse team';

const defaultCeo: CeoFounderPayload = {
  enabled: false,
  eyebrow: 'Leadership',
  sectionTitle: 'CEO & Founder',
  name: '',
  title: '',
  imageUrl: '',
  bio: '',
  detailedBio: '',
  quote: '',
  social: { linkedin: '', twitter: '', website: '' },
};

function hasCeoContent(ceo: CeoFounderPayload | undefined): boolean {
  if (!ceo || ceo.enabled === false) return false;
  return [ceo.name, ceo.bio, ceo.detailedBio, ceo.imageUrl, ceo.quote].some((x) => x && String(x).trim().length > 0);
}

const TeamPage: React.FC = () => {
  const [content, setContent] = useState<TeamPagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await teamAPI.get();
        if (!cancelled && res) {
          const showMembersSection = res.showMembersSection !== false;
          const fromApi = res.members || [];
          const members =
            fromApi.length > 0
              ? fromApi
              : showMembersSection
                ? fallbackMembers.map((m) => ({
                    name: m.name,
                    role: m.role,
                    imageUrl: m.imageUrl,
                    bio: m.bio,
                    detailedBio: m.detailedBio,
                    department: m.department,
                    social: m.social,
                  }))
                : [];
          setContent({
            hero: res.hero ?? defaultHero,
            ceoFounder: { ...defaultCeo, ...res.ceoFounder },
            stripHeading: res.stripHeading ?? defaultStripHeading,
            showMembersSection,
            members,
          });
        }
      } catch {
        if (!cancelled) {
          setContent({
            hero: defaultHero,
            ceoFounder: defaultCeo,
            stripHeading: defaultStripHeading,
            showMembersSection: true,
            members: fallbackMembers.map((m) => ({
              name: m.name,
              role: m.role,
              imageUrl: m.imageUrl,
              bio: m.bio,
              detailedBio: m.detailedBio,
              department: m.department,
              social: m.social,
            })),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const members: TeamMemberPayload[] = content?.members?.length ? content.members : [];
  const featuredMember = members[featuredIndex];
  const ceo = content?.ceoFounder;
  const showCeo = hasCeoContent(ceo);

  const goPrev = () => {
    setFeaturedIndex((i) => (i === 0 ? members.length - 1 : i - 1));
  };
  const goNext = () => {
    setFeaturedIndex((i) => (i === members.length - 1 ? 0 : i + 1));
  };
  const selectMember = (index: number) => {
    setFeaturedIndex(index);
    const strip = stripRef.current;
    if (strip) {
      const item = strip.querySelector(`[data-team-index="${index}"]`);
      item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  useEffect(() => {
    if (members.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFeaturedIndex((i) => (i === 0 ? members.length - 1 : i - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFeaturedIndex((i) => (i === members.length - 1 ? 0 : i + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [members.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 animate-fade-in-up">
        <Skeleton className="h-8 w-48" rounded="rounded-full" />
        <Skeleton className="mt-3 h-4 w-80" rounded="rounded-full" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 w-full" rounded="rounded-xl" />
          <div className="lg:col-span-2 rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
            <Skeleton className="h-6 w-48" rounded="rounded-full" />
            <Skeleton className="mt-4 h-3 w-full" rounded="rounded-full" />
            <Skeleton className="mt-2 h-3 w-5/6" rounded="rounded-full" />
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" rounded="rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hero = content?.hero ?? defaultHero;
  const stripHeading = content?.stripHeading ?? defaultStripHeading;

  if (!showCeo && members.length === 0) {
    return (
      <div className="animate-fade-in team-page" data-page="team">
        <header className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-text-primary">{hero.heading}</h1>
            <p className="mt-4 text-text-secondary">No team members to display yet.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="animate-fade-in team-page" data-page="team">
      <header className="py-16 sm:py-20 lg:py-24" aria-labelledby="team-hero-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{hero.eyebrow}</p>
          <h1
            id="team-hero-title"
            className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl"
          >
            {hero.heading}
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">{hero.subtitle}</p>
        </div>
      </header>

      {showCeo && ceo && (
        <section
          className="relative border-t border-border-subtle py-14 sm:py-20 lg:py-24 scroll-mt-6"
          aria-labelledby="ceo-section-title"
        >
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -right-20 -top-20 h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-brand-soft/35 blur-3xl dark:bg-brand-soft/20" />
            <div className="absolute -left-16 bottom-0 h-[min(40vw,320px)] w-[min(40vw,320px)] rounded-full bg-[color:var(--surface-muted)] blur-3xl opacity-80" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 lg:mb-12 lg:gap-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-primary sm:w-14" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                  {ceo.eyebrow}
                </p>
              </div>
              <h2
                id="ceo-section-title"
                className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-text-primary sm:text-3xl lg:text-4xl"
              >
                {ceo.sectionTitle}
              </h2>
            </div>

            <div className="relative overflow-hidden rounded-[1.75rem] border border-border-card bg-[color:var(--surface-card)] shadow-card sm:rounded-[2rem]">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
                style={{
                  backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
                aria-hidden="true"
              />

              <div className="relative grid grid-cols-1 items-center gap-10 p-6 sm:gap-12 sm:p-8 lg:grid-cols-12 lg:gap-14 lg:p-10 xl:p-14">
                <div className="order-2 space-y-6 sm:space-y-7 lg:order-1 lg:col-span-7 lg:space-y-8">
                  <header className="space-y-2">
                    {ceo.name ? (
                      <h3 className="text-balance text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                        {ceo.name}
                      </h3>
                    ) : null}
                    {ceo.title ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary sm:text-sm">
                        {ceo.title}
                      </p>
                    ) : null}
                  </header>

                  {(ceo.bio || ceo.detailedBio) && (
                    <div className="max-w-2xl space-y-4 text-base leading-relaxed text-text-secondary sm:text-lg">
                      {ceo.bio ? <p>{ceo.bio}</p> : null}
                      {ceo.detailedBio ? (
                        <p className="text-text-secondary/90">{ceo.detailedBio}</p>
                      ) : null}
                    </div>
                  )}

                  {ceo.quote ? (
                    <figure className="relative rounded-2xl border border-border-subtle bg-[color:var(--surface-muted)]/50 p-5 sm:p-6">
                      <span
                        className="pointer-events-none absolute left-3 top-1 font-serif text-5xl leading-none text-brand-primary/[0.18] sm:left-4 sm:text-6xl"
                        aria-hidden="true"
                      >
                        &ldquo;
                      </span>
                      <blockquote className="relative border-l-2 border-brand-primary/60 pl-4 text-base font-medium italic leading-relaxed text-text-primary sm:pl-5 sm:text-lg">
                        {ceo.quote}
                      </blockquote>
                    </figure>
                  ) : null}

                  {(ceo.social?.linkedin || ceo.social?.twitter || ceo.social?.website) && (
                    <div className="flex flex-wrap gap-2 pt-1 sm:gap-3">
                      {ceo.social.linkedin && (
                        <a
                          href={ceo.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border-card bg-[color:var(--surface-card)] px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors duration-200 hover:border-brand-primary/45 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)]"
                          aria-label={`${ceo.name}'s LinkedIn`}
                        >
                          <LinkedInIcon className="h-4 w-4 shrink-0" />
                          <span className="hidden sm:inline">LinkedIn</span>
                        </a>
                      )}
                      {ceo.social.twitter && (
                        <a
                          href={ceo.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border-card bg-[color:var(--surface-card)] px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors duration-200 hover:border-brand-primary/45 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)]"
                          aria-label={`${ceo.name}'s Twitter`}
                        >
                          <TwitterIcon className="h-4 w-4 shrink-0" />
                          <span className="hidden sm:inline">Twitter</span>
                        </a>
                      )}
                      {ceo.social.website && (
                        <a
                          href={ceo.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border-card bg-[color:var(--surface-card)] px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition-colors duration-200 hover:border-brand-primary/45 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-primary)]"
                          aria-label={`${ceo.name}'s Website`}
                        >
                          <GlobeIcon className="h-4 w-4 shrink-0" />
                          <span className="hidden sm:inline">Website</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="order-1 lg:order-2 lg:col-span-5">
                  <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                    <div
                      className="absolute -bottom-3 -right-2 left-4 top-4 rounded-3xl bg-[color:var(--surface-muted)] ring-1 ring-border-subtle/80 sm:-bottom-4 sm:-right-3 sm:left-5 sm:top-5"
                      aria-hidden="true"
                    />
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-[color:var(--surface-muted)] ring-1 ring-border-subtle shadow-lg">
                      <Image
                        src={normalizeImageUrl(ceo.imageUrl || '') || '/logo/logo-light.png'}
                        alt={ceo.name || 'CEO portrait'}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 1024px) 100vw, 42vw"
                        priority
                      />
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[color:var(--bg-primary)]/25 to-transparent dark:from-black/35"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {members.length > 0 && featuredMember && (
        <>
          <section
            className="relative py-8 sm:py-10 lg:py-12 border-t border-border-subtle"
            aria-live="polite"
            aria-label={`Featured: ${featuredMember.name}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[320px] lg:min-h-[400px]">
                <div className="order-2 lg:order-1 lg:pr-4 text-start sm:text-left">
                  <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                    {featuredMember.name}
                  </h2>
                  <p className="mt-2 text-base text-text-primary font-normal">{featuredMember.role}</p>
                  <p className="mt-5 text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
                    {featuredMember.detailedBio || featuredMember.bio}
                  </p>
                  <div
                    className="mt-4 flex items-start justify-start sm:justify-start gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={goPrev}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-card bg-surface-card text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
                      aria-label="Previous team member"
                    >
                      <Icon icon={ChevronLeftIcon} size="md" tone="primary" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-card bg-surface-card text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
                      aria-label="Next team member"
                    >
                      <Icon icon={ChevronRightIcon} size="md" tone="primary" />
                    </button>
                  </div>
                  <div
                    className="mt-6 flex flex-wrap items-start justify-start sm:justify-start gap-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {featuredMember.social?.linkedin && (
                      <a
                        href={featuredMember.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-brand-primary transition-colors p-1"
                        aria-label={`${featuredMember.name}'s LinkedIn`}
                      >
                        <LinkedInIcon className="w-5 h-5" />
                      </a>
                    )}
                    {featuredMember.social?.twitter && (
                      <a
                        href={featuredMember.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-brand-primary transition-colors p-1"
                        aria-label={`${featuredMember.name}'s Twitter`}
                      >
                        <TwitterIcon className="w-5 h-5" />
                      </a>
                    )}
                    {featuredMember.social?.website && (
                      <a
                        href={featuredMember.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-brand-primary transition-colors p-1"
                        aria-label={`${featuredMember.name}'s Website`}
                      >
                        <GlobeIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="order-1 lg:order-2 relative aspect-square sm:aspect-[4/5] lg:aspect-auto lg:min-h-[400px] rounded-lg overflow-hidden bg-[color:var(--surface-muted)]">
                  <Image
                    key={featuredMember.name}
                    src={normalizeImageUrl(featuredMember.imageUrl || '') || '/logo/logo-light.png'}
                    alt={featuredMember.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            ref={stripRef}
            className="relative py-12 sm:py-16 lg:py-20 overflow-hidden border-t border-border-subtle"
            aria-label="All team members"
          >
            <div
              className="absolute left-0 right-0 top-0 h-16 pointer-events-none z-10"
              style={{ background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)' }}
              aria-hidden="true"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <h2 className="text-lg font-bold text-text-primary mb-6 sm:mb-8">{stripHeading}</h2>
              <div className="flex flex-nowrap gap-6 sm:gap-8 lg:gap-10 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory">
                {members.map((member, index) => {
                  const isActive = member === featuredMember;
                  return (
                    <button
                      key={`${member.name}-${index}`}
                      type="button"
                      data-team-index={index}
                      onClick={() => selectMember(index)}
                      className={`flex-shrink-0 flex flex-col items-start text-start snap-start min-w-[88px] sm:min-w-[100px] py-2 px-1 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 ${
                        isActive ? 'bg-[color:var(--surface-muted)]' : 'hover:bg-[color:var(--surface-muted)]/60'
                      }`}
                      aria-pressed={isActive}
                      aria-label={`View ${member.name}, ${member.role}`}
                    >
                      <div
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 transition-[box-shadow] ${isActive ? 'ring-2 ring-[color:var(--accent-ring)] ring-offset-2 ring-offset-[color:var(--bg-primary)]' : ''}`}
                      >
                        <Image
                          src={normalizeImageUrl(member.imageUrl || '') || '/logo/logo-light.png'}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <span className="mt-2.5 text-sm font-semibold text-text-primary block truncate w-full max-w-[88px] sm:max-w-[100px]">
                        {member.name}
                      </span>
                      <span className="text-xs text-text-muted block mt-0.5 truncate w-full max-w-[88px] sm:max-w-[100px]">
                        {member.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {members.length === 0 && showCeo && (
        <section className="py-12 border-t border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-text-secondary text-sm sm:text-base">More team profiles are on the way.</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default TeamPage;
