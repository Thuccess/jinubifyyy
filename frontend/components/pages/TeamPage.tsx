 'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TwitterIcon, LinkedInIcon, GlobeIcon } from '../icons/Socials';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import Icon from '../ui/Icon';
import { teamAPI } from '../../services/api';
import type { TeamPagePayload, TeamMemberPayload } from '../../services/api';
import { teamMembers as fallbackMembers } from '../data/teamData';
import { normalizeImageUrl } from '../../utils/image';

const defaultHero = {
  eyebrow: 'Our Team',
  heading: 'Meet the People Behind Jinubify',
  subtitle: 'We are a passionate team of innovators, creators, and problem-solvers dedicated to building innovative tech and creative solutions that drive success.',
};
const defaultStripHeading = 'Browse team';

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
          setContent({
            hero: res.hero ?? defaultHero,
            stripHeading: res.stripHeading ?? defaultStripHeading,
            members: (res.members || []).length ? res.members : fallbackMembers.map((m) => ({
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
      } catch {
        if (!cancelled) {
          setContent({
            hero: defaultHero,
            stripHeading: defaultStripHeading,
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
    return () => { cancelled = true; };
  }, []);

  const members: TeamMemberPayload[] = content?.members?.length ? content.members : [];
  const featuredMember = members[featuredIndex];

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-9 w-9 rounded-full border-2 border-border-subtle border-t-text-primary animate-spin" />
      </div>
    );
  }

  const hero = content?.hero ?? defaultHero;
  const stripHeading = content?.stripHeading ?? defaultStripHeading;

  if (!featuredMember || members.length === 0) {
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
          <nav className="mb-4 text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-text-muted">
              <li>
                <Link href="/" className="hover:text-brand-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-text-secondary" aria-current="page">Our Team</li>
            </ol>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{hero.eyebrow}</p>
          <h1 id="team-hero-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            {hero.heading}
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            {hero.subtitle}
          </p>
        </div>
      </header>

      <section className="relative py-8 sm:py-10 lg:py-12" aria-live="polite" aria-label={`Featured: ${featuredMember.name}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[320px] lg:min-h-[400px]">
            <div className="order-2 lg:order-1 lg:pr-4">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">{featuredMember.name}</h2>
              <p className="mt-2 text-base text-text-primary font-normal">{featuredMember.role}</p>
              <p className="mt-5 text-text-secondary leading-relaxed max-w-xl">{featuredMember.detailedBio || featuredMember.bio}</p>
              <div className="mt-4 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
                  aria-label="Previous team member"
                >
                  <Icon icon={ChevronLeftIcon} size="md" tone="primary" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-muted/90 hover:text-text-primary transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
                  aria-label="Next team member"
                >
                  <Icon icon={ChevronRightIcon} size="md" tone="primary" />
                </button>
              </div>
              <div className="mt-6 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                {featuredMember.social?.linkedin && (
                  <a href={featuredMember.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors p-1" aria-label={`${featuredMember.name}'s LinkedIn`}>
                    <LinkedInIcon className="w-5 h-5" />
                  </a>
                )}
                {featuredMember.social?.twitter && (
                  <a href={featuredMember.social.twitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors p-1" aria-label={`${featuredMember.name}'s Twitter`}>
                    <TwitterIcon className="w-5 h-5" />
                  </a>
                )}
                {featuredMember.social?.website && (
                  <a href={featuredMember.social.website} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors p-1" aria-label={`${featuredMember.name}'s Website`}>
                    <GlobeIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="order-1 lg:order-2 relative aspect-[4/5] lg:aspect-auto lg:min-h-[400px] rounded-lg overflow-hidden bg-[color:var(--surface-muted)]">
              <Image key={featuredMember.name} src={normalizeImageUrl(featuredMember.imageUrl || '') || '/logo/logo-light.png'} alt={featuredMember.name} fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            </div>
          </div>
        </div>
      </section>

      <section ref={stripRef} className="relative py-12 sm:py-16 lg:py-20 overflow-hidden" aria-label="All team members">
        <div className="absolute left-0 right-0 top-0 h-16 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)' }} aria-hidden="true" />
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
                  className={`flex-shrink-0 flex flex-col items-center text-center snap-center min-w-[88px] sm:min-w-[100px] py-2 px-1 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 ${
                    isActive ? 'bg-[color:var(--surface-muted)]' : 'hover:bg-[color:var(--surface-muted)]/60'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`View ${member.name}, ${member.role}`}
                >
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 transition-[box-shadow] ${isActive ? 'ring-2 ring-[color:var(--accent-ring)] ring-offset-2 ring-offset-[color:var(--bg-primary)]' : ''}`}>
                    <Image src={normalizeImageUrl(member.imageUrl || '') || '/logo/logo-light.png'} alt={member.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <span className="mt-2.5 text-sm font-semibold text-text-primary block truncate w-full max-w-[88px] sm:max-w-[100px]">{member.name}</span>
                  <span className="text-xs text-text-muted block mt-0.5 truncate w-full max-w-[88px] sm:max-w-[100px]">{member.role}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
