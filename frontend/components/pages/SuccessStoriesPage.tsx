`use client`;

import React from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import { QuoteIcon, StarIcon } from '../icons/Icons';

const stories = [
  {
    title: 'From idea to launch in 12 weeks',
    client: 'SaaS startup',
    metric: '+140% trial sign‑ups',
    summary:
      'A founder came to us with a loosely defined product idea and no clear path to launch. We helped them prioritise a lean feature set, designed the onboarding and pricing journeys, and shipped an MVP they could put in front of real users.',
    quote:
      'Jinubify helped us get clarity on what to ship first—and shipped it. We had real users in weeks, not months.',
  },
  {
    title: 'Modernising a legacy brand presence',
    client: 'Professional services firm',
    metric: '+60% qualified leads',
    summary:
      'A well‑established firm was relying on a dated website that no longer reflected their positioning. Together we clarified their message, restructured services into clear offers, and launched targeted landing pages for key segments.',
    quote:
      'The new site finally reflects who we are. Prospective clients arrive better informed and ready to talk specifics.',
  },
  {
    title: 'Giving a local SME a digital engine',
    client: 'Local business',
    metric: '+3x online enquiries',
    summary:
      'A local business depended heavily on word‑of‑mouth and manual follow‑up. We created simple, focused service pages, added clear enquiry paths, and wired in light automation so new leads are acknowledged and routed without extra admin.',
    quote:
      'For the first time, we have a consistent stream of online enquiries we can actually track and respond to.',
  },
];

const SuccessStoriesPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="success-stories">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Success Stories
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Work that moves the needle
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            A snapshot of how we help teams ship better experiences, improve core metrics, and build
            sustainable digital foundations.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="case-studies-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {stories.map((story) => (
                  <article
                    key={story.title}
                    className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-7 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        {story.client}
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-text-primary">{story.title}</h2>
                      <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
                        <StarIcon className="h-4 w-4" aria-hidden />
                        {story.metric}
                      </p>
                      <p className="mt-3 text-sm text-text-secondary leading-relaxed">{story.summary}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <div className="flex gap-3">
                        <QuoteIcon className="h-6 w-6 text-brand-primary" aria-hidden />
                        <p className="text-sm text-text-secondary leading-relaxed italic">“{story.quote}”</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="engagement-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 shadow-card">
                <h2
                  id="engagement-heading"
                  className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                >
                  What working with Jinubify feels like
                </h2>
                <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Most engagements follow a simple rhythm: clarify the problem, design an approach that fits
                  your constraints, ship something useful, then learn and iterate together. We care as much
                  about the way you work after launch as we do about the launch itself.
                </p>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed sm:text-base">
                  That might mean running a focused discovery, mapping out dependencies, or pairing with your
                  internal team so they feel confident owning the outcomes. The details change from project to
                  project, but the principles—clarity, pragmatism, and honest communication—stay the same.
                </p>
                <Link
                  href="/request-quote"
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverted hover:opacity-90"
                >
                  See if we&apos;re a good fit
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SuccessStoriesPage;
