`use client`;

import React from 'react';
import AnimatedSection from '../AnimatedSection';
import { BriefcaseIcon, UserGroupIcon, MapPinIcon } from '../icons/Icons';

const CompanyProfilePage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="company-profile">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Company Profile
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Jinubify at a Glance
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            A focused digital partner helping businesses plan, build, and grow modern products and
            experiences—with a special commitment to empowering local SMEs.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="who-we-are-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10">
                <h2
                  id="who-we-are-heading"
                  className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                >
                  Who We Are
                </h2>
                <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Jinubify is a multidisciplinary team of engineers, designers, strategists, and operators
                  who care deeply about building solutions that actually work in the real world. We sit at
                  the intersection of technology, product thinking, and marketing, helping clients move from
                  idea to implementation with confidence.
                </p>
                <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                  We partner with founders, marketing teams, and business leaders who want to use digital
                  tools more intentionally—whether that means launching a new product, modernising an
                  existing platform, or building the systems that support long-term growth.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="facts-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6">
                  <BriefcaseIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">What we do</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Strategy, design, and engineering for digital products, websites, and campaigns—plus
                    the operational support to keep them performing.
                  </p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6">
                  <UserGroupIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Who we serve</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Ambitious SMEs, startups, and organisations that want a practical, accountable partner
                    rather than a one-off vendor relationship.
                  </p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6">
                  <MapPinIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Where we work</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Rooted in East Africa with a global outlook, we collaborate remotely-first while staying
                    close to the realities of the markets we serve.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="approach-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                <div>
                  <h2
                    id="approach-heading"
                    className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                  >
                    How We Work
                  </h2>
                  <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                    We favour clarity over hype, and sustainable delivery over quick wins that do not last.
                    Each engagement begins with a structured discovery phase so that we understand your
                    context, constraints, and goals before proposing solutions.
                  </p>
                  <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                    From there, we co-design a roadmap, define responsibilities, and communicate frequently
                    so that there are no surprises along the way. Our goal is to make collaboration with us
                    feel calm, predictable, and productive.
                  </p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
                  <h3 className="text-base font-semibold text-text-primary">
                    What to expect when you work with us
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-text-secondary leading-relaxed list-disc list-inside">
                    <li>Clear communication, realistic timelines, and honest trade-off discussions.</li>
                    <li>Design and engineering decisions explained in language that makes sense to you.</li>
                    <li>
                      A partner who cares about long-term health of your systems, not just launch day.
                    </li>
                    <li>
                      A bias toward measurable outcomes—whether that is growth, efficiency, or resilience.
                    </li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CompanyProfilePage;

