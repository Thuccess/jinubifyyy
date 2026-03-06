`use client`;

import React from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import { CpuChipIcon, DevicePhoneMobileIcon, ServerStackIcon, SwatchIcon } from '../icons/Icons';

const techGroups = [
  {
    name: 'Frontend & Experience',
    icon: DevicePhoneMobileIcon,
    description:
      'Modern, fast, and accessible interfaces for web and mobile so your customers can move from discovery to action without friction.',
    items: ['Next.js and React', 'TypeScript', 'Tailwind CSS and design systems'],
  },
  {
    name: 'Backend & Infrastructure',
    icon: ServerStackIcon,
    description:
      'Robust APIs and services built for reliability, observability, and maintainability as your product and traffic grow.',
    items: ['Node.js and Express', 'MongoDB and managed databases', 'HTTP/REST APIs'],
  },
  {
    name: 'Automation & Growth',
    icon: CpuChipIcon,
    description:
      'Tooling that helps you understand users, run experiments, and keep campaigns running without manual busywork.',
    items: ['Analytics and dashboards', 'Email and CRM integrations', 'Experiment and A/B tracking'],
  },
  {
    name: 'Brand & Content',
    icon: SwatchIcon,
    description:
      'Systems for a consistent visual identity and voice so every touchpoint—from website to social—feels on‑brand.',
    items: ['Design systems and UI libraries', 'Content hubs and editorial workflows', 'Social media and marketing assets'],
  },
];

const TechnologiesPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="technologies">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Technologies We Use
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            A modern, pragmatic technology stack
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            We pick tools that are battle‑tested, maintainable, and well‑suited to your context—not just the
            latest hype.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="tech-stack-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {techGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <article
                      key={group.name}
                      className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-7 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className="flex-shrink-0 w-9 h-9 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center [color:var(--text-primary)]"
                            aria-hidden
                          >
                            <Icon className="h-5 w-5 text-text-primary" />
                          </span>
                          <h2 className="text-base font-semibold text-text-primary">{group.name}</h2>
                        </div>
                        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                          {group.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border-subtle">
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                          Typical tools
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm text-text-secondary">
                          {group.items.map((item) => (
                            <li
                              key={item}
                              className="inline-flex items-center px-2.5 py-1 rounded-full border border-border-subtle bg-[color:var(--surface-muted)]"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="legacy-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10">
                <h2
                  id="legacy-heading"
                  className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                >
                  What if your stack looks different?
                </h2>
                <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Many teams come to us with an existing stack—legacy codebases, CMSs, or systems that
                  are deeply embedded in how the organisation works. Our goal is not to rip everything
                  out, but to make pragmatic improvements where they matter most.
                </p>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed sm:text-base">
                  We prefer iterative, low‑risk changes: wrapping older systems with clearer APIs,
                  modernising one surface at a time, and introducing better observability so you can
                  make decisions based on real behaviour instead of guesswork.
                </p>
                <p className="mt-4 text-sm text-text-secondary leading-relaxed sm:text-base">
                  If you would like to discuss how Jinubify can work with the tools you already have in
                  place, rather than starting from scratch, we are happy to explore that with you.
                </p>
                <Link
                  href="/contact"
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverted hover:opacity-90"
                >
                  Talk about your current stack
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TechnologiesPage;

