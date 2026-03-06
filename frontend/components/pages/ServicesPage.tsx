 'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedSection from '../AnimatedSection';
import {
  LightBulbIcon,
  PencilSquareIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
} from '../icons/Icons';
import { useServices } from '../../hooks/useServices';

/** CMS-driven service item for public display */
type ServiceDisplayItem = {
  title: string;
  intro: string;
  bulletsLabel: string;
  bullets: string[];
  slug: string;
  hasDemo: boolean;
  isFeatured?: boolean;
};

const processSteps = [
    {
        icon: <LightBulbIcon className="h-8 w-8 text-brand-primary" />,
        title: "1. Discovery & Strategy",
        description: "We start by understanding your vision, goals, and challenges to craft a tailored strategy for success."
    },
    {
        icon: <PencilSquareIcon className="h-8 w-8 text-brand-primary" />,
        title: "2. Design & Development",
        description: "Our team designs and builds your solution with precision, focusing on user experience and robust performance."
    },
    {
        icon: <RocketLaunchIcon className="h-8 w-8 text-brand-primary" />,
        title: "3. Launch & Growth",
        description: "We deploy the final product and provide ongoing support to ensure it continues to grow and deliver value."
    }
];

// --- Subcomponents ---

const ServiceSection: React.FC<{ item: ServiceDisplayItem; featured?: boolean }> = ({ item, featured }) => {
  const router = useRouter();
  const handleViewDemo = () => router.push(`/demos/${item.slug}`);
  return (
    <AnimatedSection>
      <div className={`rounded-lg border p-6 sm:p-8 flex flex-col gap-4 ${featured ? 'border-brand-primary bg-brand-soft/30' : 'border-border-subtle bg-[color:var(--surface-card)]'}`}>
        {featured && (
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Featured</span>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary border-l-4 border-brand-primary pl-4">{item.title}</h2>
        <p className="text-text-secondary leading-relaxed">{item.intro}</p>
        <p className="text-sm font-semibold text-text-primary">{item.bulletsLabel}</p>
        <ul className="space-y-2 list-disc list-inside text-text-secondary leading-relaxed">
          {item.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
        <div className="mt-4 pt-6 border-t border-border-subtle flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleViewDemo}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-primary bg-brand-soft hover:bg-surface-muted/90 rounded-md transition-colors duration-300 ease-out min-h-[44px]"
          >
            View Demo <ArrowRightIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md transition-colors min-h-[44px]"
          >
            View Packages <ArrowRightIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/contact')}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md transition-colors min-h-[44px]"
          >
            Contact us
          </button>
        </div>
      </div>
    </AnimatedSection>
  );
};

const PageHeader: React.FC = () => (
    <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Our Services</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
                Our Services
            </h1>
            <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
                At Jinubify, we help businesses, organizations, and startups grow by combining technology, design, and strategy. Our services strengthen your brand, streamline operations, and help you reach more customers—online and offline.
            </p>
        </div>
    </header>
);

const ProcessStep: React.FC<typeof processSteps[0]> = ({ icon, title, description }) => (
    <div className="flex gap-4 p-6 rounded-lg border border-border-subtle bg-[color:var(--surface-card)]">
        <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[color:var(--surface-muted)] flex items-center justify-center [color:var(--text-primary)]" aria-hidden>
            {icon}
        </span>
        <div>
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
    </div>
);

// --- Pricing Link Section ---
const PricingLinkSection: React.FC = () => {
    const router = useRouter();
    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="pricing-link-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="rounded-lg border border-border-subtle bg-[color:var(--surface-card)] p-8 sm:p-10">
                        <span className="flex w-12 h-12 rounded-lg bg-brand-primary items-center justify-center text-[color:var(--text-inverted)]" aria-hidden>
                            <CurrencyDollarIcon className="h-6 w-6" />
                        </span>
                        <h2 id="pricing-link-heading" className="mt-5 text-2xl font-bold text-text-primary sm:text-3xl">
                            Flexible Pricing Packages
                        </h2>
                        <p className="mt-4 max-w-xl text-base text-text-secondary leading-relaxed">
                            All our services come with flexible pricing options for startups, SMEs, and growing organizations. Find the right solution for your budget and needs.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <button
                                onClick={() => router.push('/pricing')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 rounded-md"
                            >
                                View All Packages <ArrowRightIcon className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                                onClick={() => router.push('/contact')}
                                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-soft rounded-md"
                            >
                                Request Custom Quote
                            </button>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

// --- Why Choose Jinubify ---
const whyChooseItems = [
  'Affordable and flexible pricing',
  'Professional and reliable service',
  'One team for digital, design, and print',
  'Solutions tailored to your business goals',
  'Support for startups, SMEs, and NGOs',
];

const WhyChooseSection: React.FC = () => (
  <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="why-choose-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimatedSection>
        <h2 id="why-choose-heading" className="text-xl font-bold text-text-primary sm:text-2xl">
          Why Choose Jinubify?
        </h2>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
          {whyChooseItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[color:var(--surface-muted)] flex items-center justify-center mt-0.5 text-brand-primary text-xs font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </AnimatedSection>
    </div>
  </section>
);

function toDisplayItem(service: any): ServiceDisplayItem {
  return {
    title: service.title ?? '',
    intro: service.intro ?? service.description ?? '',
    bulletsLabel: service.bulletsLabel ?? '',
    bullets: Array.isArray(service.bullets) ? service.bullets : [],
    slug: service.slug ?? '',
    hasDemo: service.hasDemo ?? false,
    isFeatured: service.isFeatured ?? false,
  };
}

// --- Main Services Page Component (100% CMS-driven; no static data) ---

const ServicesPage: React.FC = () => {
  const { data, isLoading, isError } = useServices({ active: true, limit: 50 });
  const apiServices = (data?.data ?? []) as any[];
  const items = useMemo(
    () => apiServices.map(toDisplayItem),
    [apiServices]
  );
  const featuredItems = useMemo(() => items.filter((i) => i.isFeatured), [items]);
  const otherItems = useMemo(() => items.filter((i) => !i.isFeatured), [items]);

  return (
    <div className="animate-fade-in">
      <PageHeader />

      <section className="py-16 sm:py-20 lg:py-24" aria-label="Services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {isLoading ? (
            <div className="py-12 text-center text-text-secondary">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary mx-auto" />
              <p className="mt-4">Loading services...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-text-secondary">
              <p>Unable to load services. Please try again later.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              <p>No services are currently available.</p>
            </div>
          ) : (
            <>
              {featuredItems.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-text-primary">Featured Services</h2>
                  <div className="space-y-8">
                    {featuredItems.map((item) => (
                      <ServiceSection key={item.slug} item={item} featured />
                    ))}
                  </div>
                </div>
              )}
              <div className={featuredItems.length > 0 ? 'space-y-6 pt-8' : ''}>
                {featuredItems.length > 0 && <h2 className="text-xl font-bold text-text-primary">All Services</h2>}
                <div className="space-y-8">
                  {(featuredItems.length > 0 ? otherItems : items).map((item) => (
                    <ServiceSection key={item.slug} item={item} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Choose Jinubify */}
      <WhyChooseSection />

      {/* Pricing Link Section */}
      <PricingLinkSection />
      
      {/* Our Process */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[color:var(--bg-secondary)]" aria-labelledby="process-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
                <h2 id="process-heading" className="text-xl font-bold text-text-primary sm:text-2xl">
                    Our Proven Process
                </h2>
                <p className="mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
                    We follow a structured, collaborative process to deliver exceptional results on time.
                </p>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {processSteps.map((step) => (
                        <ProcessStep key={step.title} {...step} />
                    ))}
                </div>
            </AnimatedSection>
        </div>
      </section>

    </div>
  );
};

export default ServicesPage;