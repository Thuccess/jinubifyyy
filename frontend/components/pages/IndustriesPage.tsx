`use client`;

import React from 'react';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import { BriefcaseIcon, UserGroupIcon, SparklesIcon } from '../icons/Icons';

const industries = [
  {
    name: 'E‑commerce & Retail',
    description:
      'Modern commerce experiences for online stores and retail brands that want better conversion and smoother operations across channels.',
    services: [
      'Higher‑converting storefronts and product discovery',
      'Operational visibility across catalogue, stock, and fulfilment',
      'Lifecycle campaigns that keep customers coming back',
    ],
    engagement: 'Typically a 3–6 month roadmap and implementation to improve key funnel metrics.',
  },
  {
    name: 'Professional Services',
    description:
      'Agencies, consultancies, and service businesses that rely on clear positioning, repeatable lead generation, and structured delivery.',
    services: [
      'Websites and funnels that qualify the right clients',
      'Secure client portals and handover workflows',
      'Reporting and analytics your team can actually use',
    ],
    engagement: 'Often a multi‑phase engagement: reposition, redesign, then optimise based on data.',
  },
  {
    name: 'Education & Training',
    description:
      'Teams running courses, programmes, or academies that need learning experiences which are engaging, measurable, and easy to operate.',
    services: [
      'Learning platforms and course delivery',
      'Content hubs for articles, videos, and resources',
      'Onboarding and progression flows that keep people engaged',
    ],
    engagement: 'Commonly a platform build or rework followed by iteration on engagement journeys.',
  },
  {
    name: 'Nonprofits & Social Impact',
    description:
      'Mission‑driven organisations that need to communicate clearly, mobilise supporters, and report on real‑world outcomes.',
    services: [
      'Story‑driven websites and impact pages',
      'Campaign and donation landing pages',
      'Supporter and donor journeys that respect capacity',
    ],
    engagement:
      'Typically a brand and website refresh with focused campaigns around key initiatives or seasons.',
  },
  {
    name: 'Startups & Product Teams',
    description:
      'Founders and product teams who need to validate ideas quickly, ship useful versions, and learn from real customers without burning the roadmap.',
    services: ['MVPs and clickable prototypes', 'Product UX/UI and flows', 'Experiment and growth frameworks'],
    engagement:
      'Frequently 6–12 week sprints to define, design, and ship an MVP, followed by cycles of iteration.',
  },
  {
    name: 'Local SMEs',
    description:
      'Owner‑led and small businesses who want a reliable digital engine for enquiries, bookings, and reputation—without extra complexity.',
    services: [
      'Credible brand presence and service pages',
      'Online booking, contact, and intake forms',
      'Always‑on optimisation as the business evolves',
    ],
    engagement:
      'Often a focused launch project plus light‑touch optimisation as your needs and offers change.',
  },
];

const IndustriesPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="industries">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Industries We Serve
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Focused on the teams we can help most
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            We work with organisations that value clarity, accountability, and thoughtful execution—from local
            SMEs to growing product teams.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="industries-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {industries.map((industry) => (
                  <article
                    key={industry.name}
                    className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-7 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex-shrink-0 w-9 h-9 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center [color:var(--text-primary)]"
                          aria-hidden
                        >
                          <BriefcaseIcon className="h-5 w-5 text-text-primary" />
                        </span>
                        <h2 className="text-base font-semibold text-text-primary">{industry.name}</h2>
                      </div>
                      <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                        {industry.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Typical focus areas
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-text-secondary leading-relaxed">
                        {industry.services.map((service) => (
                          <li key={service} className="flex items-start gap-2">
                            <span className="mt-[3px]" aria-hidden>
                              •
                            </span>
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="fit-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row gap-8 md:items-center shadow-card">
                <div className="flex-shrink-0">
                  <span
                    className="flex w-12 h-12 rounded-xl bg-[color:var(--surface-muted)] items-center justify-center [color:var(--text-primary)]"
                    aria-hidden
                  >
                    <SparklesIcon className="h-7 w-7 text-text-primary" />
                  </span>
                </div>
                <div>
                  <h2
                    id="fit-heading"
                    className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                  >
                    Not sure if your industry fits?
                  </h2>
                  <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                    The patterns we use are flexible. If your organisation relies on digital channels, juggles
                    complex workflows, or needs clearer, more data‑informed communication with customers, there
                    is a good chance we can help—even if you do not see your industry listed explicitly.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverted hover:opacity-90"
                  >
                    <UserGroupIcon className="h-4 w-4" aria-hidden />
                    Talk to us about your context
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default IndustriesPage;

