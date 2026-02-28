import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, LinkedInIcon, GlobeIcon } from '../icons/Socials';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import { teamMembers } from '../data/teamData';
import type { TeamMember } from '../data/teamData';

const TeamPage: React.FC = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const featuredMember = teamMembers[featuredIndex];

  const goPrev = () => {
    setFeaturedIndex((i) => (i === 0 ? teamMembers.length - 1 : i - 1));
  };
  const goNext = () => {
    setFeaturedIndex((i) => (i === teamMembers.length - 1 ? 0 : i + 1));
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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFeaturedIndex((i) => (i === 0 ? teamMembers.length - 1 : i - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFeaturedIndex((i) => (i === teamMembers.length - 1 ? 0 : i + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!featuredMember) return null;

  return (
    <div className="animate-fade-in team-page" data-page="team">
      {/* First section: same structure as Services, About, Contact, Demos */}
      <header className="py-16 sm:py-20 lg:py-24" aria-labelledby="team-hero-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-text-muted">
              <li>
                <Link
                  to="/"
                  className="hover:text-brand-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-text-secondary" aria-current="page">
                Our Team
              </li>
            </ol>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Our Team</p>
          <h1 id="team-hero-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Meet the People Behind Jinubify
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            We are a passionate team of innovators, creators, and problem-solvers dedicated to building innovative tech and creative solutions that drive success.
          </p>
        </div>
      </header>

      {/* Featured member hero: two columns + prev/next */}
      <section
        className="relative py-8 sm:py-10 lg:py-12"
        aria-live="polite"
        aria-label={`Featured: ${featuredMember.name}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[320px] lg:min-h-[400px]">
            {/* Prev button */}
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-text-muted hover:text-text-primary rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
              aria-label="Previous team member"
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>
            {/* Next button */}
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-text-muted hover:text-text-primary rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
              aria-label="Next team member"
            >
              <ChevronRightIcon className="w-8 h-8" />
            </button>

            {/* Left column: name, title, bio, optional social */}
            <div className="order-2 lg:order-1 lg:pr-4">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                {featuredMember.name}
              </h2>
              <p className="mt-2 text-base text-text-primary font-normal">
                {featuredMember.role}
              </p>
              <p className="mt-5 text-text-secondary leading-relaxed max-w-xl">
                {featuredMember.detailedBio}
              </p>
              <div className="mt-6 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                {featuredMember.social.linkedin && (
                  <a
                    href={featuredMember.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-brand-primary transition-colors p-1"
                    aria-label={`${featuredMember.name}'s LinkedIn profile`}
                  >
                    <LinkedInIcon className="w-5 h-5" />
                  </a>
                )}
                {featuredMember.social.twitter && (
                  <a
                    href={featuredMember.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-brand-primary transition-colors p-1"
                    aria-label={`${featuredMember.name}'s Twitter profile`}
                  >
                    <TwitterIcon className="w-5 h-5" />
                  </a>
                )}
                {featuredMember.social.website && (
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

            {/* Right column: large portrait */}
            <div className="order-1 lg:order-2 relative aspect-[4/5] lg:aspect-auto lg:min-h-[400px] rounded-lg overflow-hidden bg-[color:var(--surface-muted)]">
              <img
                key={featuredMember.name}
                src={featuredMember.imageUrl}
                alt=""
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom strip: "Browse team" + circular headshots */}
      <section
        ref={stripRef}
        className="relative py-12 sm:py-16 lg:py-20 overflow-hidden"
        aria-label="All team members"
      >
        <div
          className="absolute left-0 right-0 top-0 h-16 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <h2 className="text-lg font-bold text-text-primary mb-6 sm:mb-8">Browse team</h2>
          <div className="flex flex-nowrap gap-6 sm:gap-8 lg:gap-10 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory">
            {teamMembers.map((member, index) => {
              const isActive = member === featuredMember;
              return (
                <button
                  key={member.name}
                  type="button"
                  data-team-index={index}
                  onClick={() => selectMember(index)}
                  className={`flex-shrink-0 flex flex-col items-center text-center snap-center min-w-[88px] sm:min-w-[100px] py-2 px-1 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2 ${
                    isActive ? 'bg-[color:var(--surface-muted)]' : 'hover:bg-[color:var(--surface-muted)]/60'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`View ${member.name}, ${member.role}`}
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 transition-[box-shadow] ${
                      isActive ? 'ring-2 ring-[color:var(--accent-ring)] ring-offset-2 ring-offset-[color:var(--bg-primary)]' : ''
                    }`}
                  >
                    <img
                      src={member.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
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
    </div>
  );
};

export default TeamPage;
