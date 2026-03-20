 'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AnimatedSection from '../AnimatedSection';
import { useServiceBySlug } from '../../hooks/useServices';
import { ArrowRightIcon } from '../icons/Icons';
import StructuredData from '../seo/StructuredData';
import { siteConfig } from '../../config/site';
import SkeletonBlock from '../skeletons/SkeletonBlock';
import SkeletonText from '../skeletons/SkeletonText';

const ServiceDetailPage: React.FC = () => {
  const params = useParams();
  const slug = (params?.slug as string) || undefined;
  const router = useRouter();
  const { data, isLoading, isError } = useServiceBySlug(slug);
  const service = data?.data || data || null;

  useEffect(() => {
    if (!service?.title) return;
    const prev = document.title;
    document.title = `${service.title} – Jinubify Services`;
    return () => {
      document.title = prev || 'Jinubify';
    };
  }, [service?.title]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <header className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SkeletonBlock className="h-3 w-20" rounded="full" />
            <SkeletonBlock className="mt-4 h-8 w-64 sm:w-80 lg:w-96" rounded="full" />
            <SkeletonText className="mt-5 max-w-xl" lines={3} />
            <div className="mt-8 flex flex-wrap gap-3">
              <SkeletonBlock className="h-11 w-40" rounded="xl" />
              <SkeletonBlock className="h-11 w-36" rounded="xl" />
            </div>
          </div>
        </header>

        <main className="pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <AnimatedSection>
              <section className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
                <SkeletonBlock className="h-5 w-56" rounded="full" />
                <SkeletonText className="mt-4" lines={4} />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
                <SkeletonBlock className="h-5 w-40" rounded="full" />
                <SkeletonText className="mt-4 max-w-3xl" lines={5} />
              </section>
            </AnimatedSection>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-text-primary">Service not found</p>
          <p className="text-sm text-text-secondary">
            The service you&apos;re looking for is unavailable or has been removed.
          </p>
          <button
            onClick={() => router.push('/services')}
            className="btn-primary inline-flex items-center gap-2"
          >
            Back to Services
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const bullets = Array.isArray(service.bullets) ? service.bullets : [];
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.title,
    provider: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    areaServed: 'Worldwide',
    description: (service.intro || service.shortDescription || service.description || '').slice(0, 300),
  };

  return (
    <div className="animate-fade-in">
      <StructuredData data={serviceSchema} />
      <header className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Service
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
            {service.title}
          </h1>
          <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
            {service.intro || service.shortDescription || service.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="btn-primary inline-flex items-center gap-2"
            >
              View Packages
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/contact')}
              className="btn-primary inline-flex items-center"
            >
              Talk to us
            </button>
          </div>
        </div>
      </header>

      <main className="pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {(service.bulletsLabel || bullets.length > 0) && (
            <AnimatedSection>
              <section className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
                {service.bulletsLabel && (
                  <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                    {service.bulletsLabel}
                  </h2>
                )}
                {bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-text-secondary leading-relaxed list-disc list-inside">
                    {bullets.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            </AnimatedSection>
          )}

          {service.description && (
            <AnimatedSection>
              <section className="rounded-xl border border-border-subtle bg-[color:var(--surface-card)] p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                  Overview
                </h2>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </section>
            </AnimatedSection>
          )}
        </div>
      </main>
    </div>
  );
};

export default ServiceDetailPage;

