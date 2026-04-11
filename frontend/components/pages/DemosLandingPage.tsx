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
  DevicePhoneMobileIcon,
  CpuChipIcon,
  ServerStackIcon,
  DocumentTextIcon,
} from '../icons/Icons';
import { useServicesWithDemos } from '../../hooks/useServices';
import SkeletonBlock from '../skeletons/SkeletonBlock';
import WebsiteDemosCatalogSection from './demos/WebsiteDemosCatalogSection';
import { isWebDesignDevelopmentService } from '../../utils/isWebDesignDevelopmentService';

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
        Browse website showcases, then explore service-specific galleries when you are ready to go deeper.
      </p>
    </div>
  </header>
);

const ServiceExploreCard: React.FC<{ item: DemoDisplayItem }> = ({ item }) => {
  const router = useRouter();
  const showWebDemoActions = isWebDesignDevelopmentService(item);
  const handleViewDemo = () => router.push('/demos');
  const tagline = getTagline(item.intro);
  const icon = slugToIcon[item.slug] ?? null;

  return (
    <AnimatedSection>
      <div className="rounded-lg border border-border-card bg-[color:var(--surface-card)] overflow-hidden flex flex-col h-full shadow-card">
        <div className="aspect-[4/3] min-h-[120px] bg-[color:var(--surface-muted)] flex items-center justify-center p-6" aria-hidden="true">
          {icon ? (
            <span className="w-14 h-14 rounded-lg bg-[color:var(--surface-card)] border border-border-card flex items-center justify-center [color:var(--text-primary)]">
              {icon}
            </span>
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[color:var(--surface-card)] border border-border-card shadow-card" />
          )}
        </div>
        <div className="p-5 sm:p-6 flex flex-col gap-3 flex-grow">
          <h2 className="text-lg font-bold text-text-primary">{item.title}</h2>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2 flex-grow">{tagline}</p>
          <div className="pt-2 flex flex-wrap gap-2">
            {showWebDemoActions ? (
              <button
                type="button"
                onClick={handleViewDemo}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold btn-primary rounded-md min-h-[40px]"
              >
                View Demo <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-brand-primary bg-brand-soft hover:bg-surface-muted/90 rounded-md transition-colors duration-300 ease-out min-h-[40px]"
            >
              View Packages
            </button>
            {showWebDemoActions ? (
              <button
                type="button"
                onClick={() => router.push('/contact')}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md transition-colors min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
              >
                Contact us
              </button>
            ) : null}
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
          <div className="rounded-lg border border-border-card bg-[color:var(--surface-card)] p-6 sm:p-8 shadow-card">
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

const ServiceDemosSection: React.FC = () => {
  const { data, isLoading, isError, refetch } = useServicesWithDemos();
  const services = (data?.data || []) as Array<{
    _id: string;
    title: string;
    slug: string;
    intro?: string;
    description?: string;
  }>;

  const displayList: DemoDisplayItem[] = services.map((s) => ({
    id: s._id,
    title: s.title,
    slug: s.slug,
    intro: s.intro || s.description || '',
  }));

  return (
    <section className="border-t border-border-subtle py-16 sm:py-20" aria-labelledby="service-demos-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="service-demos-heading" className="text-xl font-bold text-text-primary sm:text-2xl">
          Explore by service
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          Open a service gallery to see screenshots and examples for that line of work.
        </p>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border-card bg-[color:var(--surface-card)] p-4 shadow-card">
                  <SkeletonBlock className="h-44 w-full" rounded="xl" />
                  <SkeletonBlock className="mt-4 h-4 w-3/4" rounded="full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-text-secondary">
              Couldn&apos;t load services.{' '}
              <button
                type="button"
                onClick={() => refetch()}
                className="font-semibold text-brand-primary hover:underline"
              >
                Retry
              </button>
            </p>
          ) : displayList.length === 0 ? (
            <p className="text-sm text-text-muted">No service galleries yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayList.map((item, index) => (
                <ServiceExploreCard key={item.id ?? item.slug ?? index} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const DemosLandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Demos | Jinubify';
    return () => {
      document.title = 'Jinubify';
    };
  }, []);

  return (
    <div className="animate-fade-in demos-page" data-page="demos">
      <DemosHero />

      <WebsiteDemosCatalogSection />

      <ServiceDemosSection />

      <WhyChooseSection />
      <PricingLinkSection />

    </div>
  );
};

export default DemosLandingPage;
