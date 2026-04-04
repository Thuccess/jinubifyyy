'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AnimatedSection from '../AnimatedSection';
import { RocketLaunchIcon, EyeIcon, SparklesIcon, HeartIcon, StarIcon } from '../icons/Icons';

const ValueItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <li className="flex gap-4 text-left">
    <span
      className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center [color:var(--text-primary)]"
      aria-hidden
    >
      {icon}
    </span>
    <div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  </li>
);

const MissionVisionPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="animate-fade-in" data-page="mission-vision">
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-xs font-semibold uppercase tracking-wider text-text-muted"
            aria-hidden="true"
          >
            Mission & Vision
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            Our Mission and Vision
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            We exist to bridge the gap between technology and human need. Here is the purpose that
            drives us and the future we are building toward.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push('/about')}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
            >
              Our Story
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="text-sm font-medium text-text-secondary hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] rounded"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="mission-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <span
                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center [color:var(--text-primary)]"
                    aria-hidden
                  >
                    <RocketLaunchIcon className="h-7 w-7 text-text-primary" />
                  </span>
                  <div>
                    <h2
                      id="mission-heading"
                      className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                    >
                      Our Mission
                    </h2>
                    <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                      To empower businesses and individuals with accessible, human-centred digital
                      solutions that are both powerful and a joy to use. We believe that great
                      technology should not be reserved for the few—it should be within reach of
                      every organisation that wants to grow, innovate, and serve their communities
                      with clarity and confidence.
                    </p>
                    <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                      We combine deep technical expertise with a relentless focus on user experience
                      and outcomes. Whether we are building products, guiding strategy, or
                      supporting teams, our mission is to deliver solutions that work in the real
                      world and create lasting value.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24"
          aria-labelledby="vision-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="rounded-xl border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 lg:p-10 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <span
                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center [color:var(--text-primary)]"
                    aria-hidden
                  >
                    <EyeIcon className="h-7 w-7 text-text-primary" />
                  </span>
                  <div>
                    <h2
                      id="vision-heading"
                      className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                    >
                      Our Vision
                    </h2>
                    <p className="mt-5 text-base text-text-secondary leading-relaxed sm:text-lg">
                      A world where every organisation—from local SMEs to growing enterprises—can
                      leverage technology to compete, innovate, and thrive. We envision a future
                      where digital tools are inclusive, understandable, and aligned with the people
                      who use them every day.
                    </p>
                    <p className="mt-4 text-base text-text-secondary leading-relaxed sm:text-lg">
                      We are committed to being a trusted partner on that journey: helping our
                      clients make better decisions, ship with confidence, and build systems that
                      scale with their ambitions. Our vision is not only about what we build, but
                      about the impact we enable—stronger teams, clearer strategies, and more
                      resilient businesses.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]"
          aria-labelledby="values-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                <div className="lg:col-span-5">
                  <h2
                    id="values-heading"
                    className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl"
                  >
                    What Guides Us
                  </h2>
                  <p className="mt-5 text-base text-text-secondary leading-relaxed">
                    Our mission and vision are brought to life through the values we hold in
                    everything we do: accountability, customer focus, and a commitment to
                    empowering local businesses.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-brand-primary">
                    Expertise, innovation, and accountability.
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <ul className="space-y-6" role="list">
                    <ValueItem
                      icon={<SparklesIcon className="h-8 w-8 text-text-primary" />}
                      title="Accountable to our partners"
                      description="We take responsibility for our commitments and deliver on our promises to every client and team member. Transparency and follow-through are non-negotiable."
                    />
                    <ValueItem
                      icon={<HeartIcon className="h-8 w-8 text-text-primary" />}
                      title="Customer-centricity"
                      description="Our clients are our partners. We are deeply committed to understanding their goals, constraints, and success metrics—and we design our work around them."
                    />
                    <ValueItem
                      icon={<StarIcon className="h-8 w-8 text-text-primary" />}
                      title="Empowering local SMEs"
                      description="We help small and medium businesses grow with accessible tools, clear strategies, and practical support that levels the playing field in a digital-first world."
                    />
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

export default MissionVisionPage;
