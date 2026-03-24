 'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SmartImage from '@/components/media/SmartImage';
import VideoThumbnail from '@/components/media/VideoThumbnail';
import AnimatedSection from '../AnimatedSection';
import { normalizeImageUrl } from '../../utils/image';
import { useServiceBySlug, useDemosByServiceSlug } from '../../hooks/useServices';
import { Skeleton, SkeletonCard } from '../ui/skeleton';

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
    /** Optional showcase video — when set, thumbnail opens muted modal instead of navigating. */
    videoUrl?: string;
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
      <div className="animate-fade-in-up max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Skeleton className="h-8 w-64" rounded="rounded-full" />
        <Skeleton className="mt-4 h-4 w-72" rounded="rounded-full" />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-auto" />
          ))}
        </div>
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

                const hasVideo = Boolean(demo.videoUrl?.trim());

                return (
                  <AnimatedSection key={demo._id}>
                    <div className="card-solid flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border-subtle text-left transition-all duration-200 hover:border-border-accent hover:shadow-lg">
                      <div className="relative min-h-[160px] w-full bg-transparent">
                        {hasVideo && coverUrl ? (
                          <VideoThumbnail
                            src={coverUrl}
                            alt={demo.title}
                            videoUrl={demo.videoUrl!.trim()}
                            videoTitle={demo.title}
                            aspect="4/3"
                            rounded="none"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        ) : coverUrl ? (
                          <button
                            type="button"
                            onClick={() => router.push(`/demos/${serviceSlug}`)}
                            className="relative block w-full bg-transparent text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent-ring)]"
                          >
                            <SmartImage
                              src={coverUrl}
                              alt={demo.title}
                              aspect="4/3"
                              rounded="none"
                              sizes="(max-width: 768px) 100vw, 400px"
                              className="pointer-events-none"
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => router.push(`/demos/${serviceSlug}`)}
                            className="flex min-h-[160px] w-full items-center justify-center bg-transparent text-sm text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent-ring)]"
                          >
                            No image
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/demos/${serviceSlug}`)}
                        className="flex flex-grow flex-col p-5 pb-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent-ring)] sm:p-6"
                      >
                        <h2 className="text-lg font-bold text-text-primary">{demo.title}</h2>
                      </button>
                    </div>
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
