`use client`;

import React from 'react';
import AnimatedSection from '../AnimatedSection';
import { DocumentTextIcon, LightBulbIcon, ServerStackIcon } from '../icons/Icons';
import CallToAction from '../sections/CallToAction';

const ResourcesPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="resources">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Resources
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Tools, Templates & Playbooks
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            A curated hub of practical resources to help you move from idea to execution: checklists,
            worksheets, and reference guides you can adapt to your own context.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="resource-types-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <DocumentTextIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Planning templates</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Roadmap outlines, discovery questions, and requirement templates to align your team
                    before you commit to building.
                  </p>
                </div>
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <LightBulbIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Strategy guides</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Short, opinionated guides on topics like prioritisation, experimentation, and launching
                    with confidence.
                  </p>
                </div>
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <ServerStackIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Downloadable assets</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Simple spreadsheets and documents you can duplicate and customise for your own
                    organisation and projects.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="how-to-use-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 shadow-card">
                <h2
                  id="how-to-use-heading"
                  className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                >
                  How to make the most of these resources
                </h2>
                <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Every organisation is different, so treat these resources as starting points rather than
                  rigid rules. Use them to spark conversations, clarify assumptions, and document decisions.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-text-secondary leading-relaxed list-disc list-inside">
                  <li>Run workshops with your team using the questions and worksheets provided.</li>
                  <li>Adapt checklists to match your own governance, risk, and decision-making processes.</li>
                  <li>Use logs and templates to build a history of what you have tried and learned.</li>
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

export default ResourcesPage;

