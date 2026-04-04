`use client`;

import React from 'react';
import AnimatedSection from '../AnimatedSection';
import { MegaphoneIcon, DocumentTextIcon, CameraIcon } from '../icons/Icons';

const PressMediaPage: React.FC = () => {
  return (
    <div className="animate-fade-in" data-page="press-media">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted" aria-hidden="true">
            Press & Media
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Press & Media Resources
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            Key information, messaging, and assets for journalists, partners, and collaborators who want to
            feature or reference Jinubify.
          </p>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <section className="py-0 sm:py-4" aria-labelledby="about-jinubify-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 shadow-card">
                <h2
                  id="about-jinubify-heading"
                  className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                >
                  About Jinubify
                </h2>
                <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                  Jinubify is a digital partner focused on helping businesses turn ideas into resilient,
                  human-centred products and experiences. We combine strategy, design, and engineering with a
                  strong emphasis on empowering local SMEs and growing organisations.
                </p>
                <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                  We work across web and product development, brand and content, and growth enablement—always
                  anchored in clear communication and measurable outcomes.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="media-assets-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <MegaphoneIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Key messages</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Jinubify exists to bridge the gap between technology and human need. Our work focuses on
                    clarity, accountability, and practical value for clients.
                  </p>
                </div>
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <DocumentTextIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Company facts</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Founded in 2024, operating remotely-first, with a team experienced in product, design,
                    engineering, and growth across multiple industries.
                  </p>
                </div>
                <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 shadow-card">
                  <CameraIcon className="h-8 w-8 text-text-primary" aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">Brand assets</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    Logos and visual assets are available on request. We are happy to provide the most
                    up-to-date files and guidance on correct usage.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="press-contact-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 text-center shadow-card">
                <h2
                  id="press-contact-heading"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary"
                >
                  Press & media enquiries
                </h2>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-2xl mx-auto">
                  For interviews, quotes, speaking engagements, or background information, please contact us
                  through the main contact page. Share your publication, topic, and timelines so that we can
                  respond quickly and helpfully.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PressMediaPage;

