 'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AnimatedSection from '../AnimatedSection';
import { normalizeImageUrl } from '../../utils/image';
import { useServiceBySlug, useDemosByServiceSlug } from '../../hooks/useServices';

const DemoOverviewPage: React.FC = () => {
  const params = useParams();
  const serviceSlug = params?.serviceSlug as string | undefined;
  const router = useRouter();
  const { data: serviceData, isLoading: serviceLoading, isError: serviceError } = useServiceBySlug(serviceSlug);
  const { data: demosData, isLoading: demosLoading, isError: demosError } = useDemosByServiceSlug(serviceSlug);

  const service = serviceData?.data as { _id: string; title: string; slug: string } | undefined;
  const demos = (demosData?.data || []) as Array<{
    _id: string;
    title: string;
    slug: string;
    coverImageUrl?: string;
    images?: { url: string; order: number }[];
    service?: { title: string; slug: string };
  }>;

  const isLoading = serviceLoading || demosLoading;
  const isError = serviceError || demosError;

  useEffect(() => {
    if (service?.title) {
      document.title = `See it in action – ${service.title} | Demos`;
    } else {
      document.title = 'Demos | Jinubify';
    }
    return () => {
      document.title = 'Jinubify';
    };
  }, [service?.title]);

  if (!isLoading && !service) {
    return (
      <div className="animate-fade-in min-h-[50vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Not found</h1>
        <p className="text-text-secondary mb-6">This service or its demos could not be found.</p>
        <button
          onClick={() => router.push('/demos')}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary rounded-lg hover:brightness-110"
        >
          Back to Demos
        </button>
      </div>
    );
  }

  if (isLoading || !service) {
    return (
      <div className="animate-fade-in min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary" aria-hidden="true" />
      </div>
    );
  }

  const serviceName = service.title;

  return (
    <div className="animate-fade-in demos-overview-page" data-page="demos-overview">
      <section className="relative isolate overflow-hidden py-12 sm:py-16" aria-labelledby="overview-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary bg-brand-soft rounded-full mb-4" aria-hidden="true">
              Demos
            </span>
            <h1 id="overview-title" className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              See it in action – {serviceName}
            </h1>
            <p className="mt-3 text-base text-text-secondary sm:text-lg">
              All product types we offer
            </p>
          </div>
        </div>
      </section>

      <div className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {demos.length === 0 ? (
            <p className="text-center text-text-secondary py-12">No demos available for this service yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {demos.map((demo) => {
                const sortedImages = [...(demo.images || [])].sort((a, b) => a.order - b.order);
                const rawCover = demo.coverImageUrl || sortedImages[0]?.url || '';
                const coverUrl = rawCover ? normalizeImageUrl(rawCover) : '';

                return (
                  <AnimatedSection key={demo._id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/demos/${serviceSlug}`)}
                      className="w-full text-left card-solid rounded-2xl border border-border-subtle overflow-hidden flex flex-col h-full transition-all duration-200 hover:border-border-accent hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                    >
                      <div className="aspect-[4/3] min-h-[160px] bg-surface-muted overflow-hidden relative">
                        {coverUrl ? (
                          <Image
                            src={coverUrl}
                            alt={demo.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-5 sm:p-6 flex flex-col flex-grow">
                        <h2 className="text-lg font-bold text-text-primary">
                          {demo.title}
                        </h2>
                      </div>
                    </button>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoOverviewPage;
