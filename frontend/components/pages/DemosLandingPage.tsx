 'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedSection from '../AnimatedSection';
import {
  ArrowRightIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  ServerStackIcon,
  DocumentTextIcon,
} from '../icons/Icons';
import { useDemos } from '../../hooks/useServices';

interface DemoDisplayItem {
  id?: string;
  title: string;
  slug: string;
  intro: string;
}

const whyChooseItems = [
  'Affordable and flexible pricing',
  'Professional and reliable service',
  'One team for digital, design, and print',
  'Solutions tailored to your business goals',
  'Support for startups, SMEs, and NGOs',
];

const slugToIcon: Record<string, React.ReactNode> = {
  'social-media-management': <ChatBubbleLeftRightIcon className="h-8 w-8 text-brand-primary" />,
  'digital-marketing': <MegaphoneIcon className="h-8 w-8 text-brand-primary" />,
  'graphic-design-branding': <PaintBrushIcon className="h-8 w-8 text-brand-primary" />,
  'website-design-development': <CodeBracketIcon className="h-8 w-8 text-brand-primary" />,
  'mobile-app-development': <DevicePhoneMobileIcon className="h-8 w-8 text-brand-primary" />,
  'software-development': <CpuChipIcon className="h-8 w-8 text-brand-primary" />,
  'cloud-hosting': <ServerStackIcon className="h-8 w-8 text-brand-primary" />,
  'printing-services': <DocumentTextIcon className="h-8 w-8 text-brand-primary" />,
};

function getTagline(intro: string): string {
  if (!intro) return '';
  const firstPeriod = intro.indexOf('.');
  if (firstPeriod === -1) return intro;
  return intro.slice(0, firstPeriod + 1).trim();
}

const DemosHero: React.FC = () => (
  <header className="py-16 sm:py-20 lg:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Demos</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
        See Our Demos
      </h1>
      <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
        Explore live demos and samples for each service. See what we deliver before you commit.
      </p>
    </div>
  </header>
);

const DemoCard: React.FC<{ item: DemoDisplayItem }> = ({ item }) => {
  const router = useRouter();
  const handleViewDemo = () => router.push(`/demos/${item.slug}`);
  const tagline = getTagline(item.intro);
  const icon = slugToIcon[item.slug] ?? null;

  return (
    <AnimatedSection>
      <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] overflow-hidden flex flex-col h-full">
        <div className="aspect-[4/3] min-h-[120px] bg-[color:var(--surface-muted)] flex items-center justify-center p-6" aria-hidden="true">
          {icon ? (
            <span className="w-14 h-14 rounded-lg bg-[color:var(--surface-card)] border border-border-subtle flex items-center justify-center [color:var(--text-primary)]">
              {icon}
            </span>
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[color:var(--surface-card)] border border-border-subtle" />
          )}
        </div>
        <div className="p-5 sm:p-6 flex flex-col gap-3 flex-grow">
          <h2 className="text-lg font-bold text-text-primary">{item.title}</h2>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 flex-grow">{tagline}</p>
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleViewDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold btn-primary rounded-md min-h-[40px]"
            >
              View Demo <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-brand-primary bg-brand-soft hover:bg-surface-muted/90 rounded-md transition-colors duration-300 ease-out min-h-[40px]"
            >
              View Packages
            </button>
            <button
              type="button"
              onClick={() => router.push('/contact')}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md transition-colors min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
            >
              Contact us
            </button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

const WhyChooseSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="demos-why-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatedSection>
        <h2 id="demos-why-heading" className="text-xl font-bold text-text-primary sm:text-2xl">
          Why Choose Jinubify?
        </h2>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
          {whyChooseItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[color:var(--surface-muted)] flex items-center justify-center mt-0.5 text-brand-primary text-xs font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </AnimatedSection>
    </div>
  </section>
);

const PricingLinkSection: React.FC = () => {
  const router = useRouter();
  return (
    <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="demos-pricing-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
            <span className="flex w-12 h-12 rounded-lg bg-brand-primary items-center justify-center text-[color:var(--text-inverted)]" aria-hidden>
              <CurrencyDollarIcon className="h-6 w-6" />
            </span>
            <h2 id="demos-pricing-heading" className="mt-5 text-xl font-bold text-text-primary sm:text-2xl">
              Flexible Pricing Packages
            </h2>
            <p className="mt-3 text-sm text-text-secondary max-w-xl">
              All our services come with flexible pricing options for startups, SMEs, and growing organizations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => router.push('/pricing')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md">
                View All Packages <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
              <button onClick={() => router.push('/contact')} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-brand-primary bg-brand-soft hover:bg-surface-muted/90 rounded-md transition-colors duration-300 ease-out">
                Request Custom Quote
              </button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

const DemosLandingPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDemos({ active: true });
  const demos = (data?.data || []) as Array<{
    _id: string;
    title: string;
    slug: string;
    description?: string;
    service?: { slug: string; title: string };
  }>;

  const displayList: DemoDisplayItem[] = demos.map((d) => ({
    id: d._id,
    title: d.title,
    slug: d.slug,
    intro: d.description ?? '',
  }));

  useEffect(() => {
    document.title = 'Demos | Jinubify';
    return () => { document.title = 'Jinubify'; };
  }, []);

  return (
    <div className="animate-fade-in demos-page" data-page="demos">
      <DemosHero />

      <div className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary" aria-hidden="true" />
            </div>
          ) : (
            <>
              {isError && (
                <div className="text-center mb-6">
                  <p className="text-text-secondary text-sm">
                    Couldn&apos;t load demos.{' '}
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="text-brand-primary font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] rounded"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              )}
              {!isError && demos.length === 0 && (
                <p className="text-center text-text-secondary text-sm mb-6">
                  No demos have been configured yet. Create demos in the admin dashboard.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayList.map((item, index) => (
                  <DemoCard
                    key={item.id ?? item.slug ?? index}
                    item={item}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <WhyChooseSection />
      <PricingLinkSection />

    </div>
  );
};

export default DemosLandingPage;
