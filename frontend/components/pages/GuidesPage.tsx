`use client`;

import React from 'react';
import AnimatedSection from '../AnimatedSection';
import { LightBulbIcon, PencilSquareIcon, RocketLaunchIcon } from '../icons/Icons';
import CallToAction from '../sections/CallToAction';

const GuidesPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="guides">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Guides & Knowledge Base
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Practical Guides for Modern Teams
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            Opinionated, actionable guides that help you make better decisions about strategy, design,
            technology, and growth—without the buzzword soup.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="guide-themes-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6">
                  <LightBulbIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Foundations</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Guides on discovery, problem framing, prioritisation, and aligning stakeholders before
                    you start building.
                  </p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6">
                  <PencilSquareIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Design & delivery</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Practical advice on shaping features, scoping releases, collaborating across disciplines,
                    and avoiding common delivery pitfalls.
                  </p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6">
                  <RocketLaunchIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Launch & beyond</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Guidance for launching with confidence, measuring impact, and iterating based on real
                    usage—not just intuition.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="using-guides-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10">
                <h2
                  id="using-guides-heading"
                  className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                >
                  How to use these guides with your team
                </h2>
                <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Use each guide as a shared reference point. Instead of debating from memory or preference,
                  bring the guide into the conversation so everyone starts from the same understanding.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-text-secondary leading-relaxed list-disc list-inside">
                  <li>Work through key sections together in short, focused sessions.</li>
                  <li>Capture decisions and open questions as you go, so they do not get lost.</li>
                  <li>Return to the same guides when you revisit strategy or plan new work.</li>
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24" aria-label="Call to action">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CallToAction />
          </div>
        </section>
      </main>
    </div>
  );
};

export default GuidesPage;

