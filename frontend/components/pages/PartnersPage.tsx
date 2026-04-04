`use client`;

import React from 'react';
import AnimatedSection from '../AnimatedSection';
import { HandshakeIcon, ChartBarIcon, MapPinIcon } from '../icons/Icons';

const PartnersPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="partners">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Partnerships
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Partnering for Long-Term Impact
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            We collaborate with agencies, platforms, and specialists who share our commitment to clarity,
            accountability, and meaningful outcomes for clients.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="partner-with-us-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 shadow-card">
                <h2
                  id="partner-with-us-heading"
                  className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                >
                  Why partners choose Jinubify
                </h2>
                <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Our partners see us as a trusted extension of their own teams. We bring deep technical
                  and product expertise, a calm and structured way of working, and a focus on doing what is
                  best for the end client.
                </p>
                <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Whether we support a specific project, white-label delivery, or long-term capacity, our
                  goal is to make collaboration smooth, predictable, and outcome-focused.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="partner-models-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <HandshakeIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Strategic alliances</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    We co-design, co-sell, and co-deliver with partners who bring complementary strengths in
                    marketing, data, or vertical expertise.
                  </p>
                </div>
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <ChartBarIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Delivery partnerships</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Agencies and consultancies rely on us to handle complex technical delivery, architecture,
                    and implementation details with confidence.
                  </p>
                </div>
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <MapPinIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Platform ecosystems</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    We integrate with platforms and tools in the wider ecosystem, helping mutual customers
                    get more value from the technology they already use.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="become-partner-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 text-center shadow-card">
                <h2
                  id="become-partner-heading"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary"
                >
                  Interested in partnering with Jinubify?
                </h2>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto">
                  Share a bit about your organisation, your clients, and how you think we might work
                  together. We will follow up with a short conversation to explore fit and potential models.
                </p>
                <p className="mt-4 text-sm text-text-secondary">
                  You can reach us via the contact page or by booking a consultation from the main site.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PartnersPage;

