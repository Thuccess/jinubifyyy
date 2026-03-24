'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedSection from '../AnimatedSection';
import { useDemosByServiceSlug } from '../../hooks/useServices';
import { normalizeImageUrl } from '../../utils/image';
import { Skeleton } from '../ui/skeleton';
import Lightbox from '@/components/media/Lightbox';
import SmartImage from '@/components/media/SmartImage';

function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title) document.title = `${title} | Demos`;
    return () => {
      document.title = 'Jinubify';
    };
  }, [title]);
}

const DemoGalleryPage: React.FC = () => {
  const params = useParams();
  const serviceSlug = params?.serviceSlug as string | undefined;
  const router = useRouter();
  const { data, isLoading, isError } = useDemosByServiceSlug(serviceSlug);

  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const demos = (data?.data || []) as Array<{
    _id: string;
    title: string;
    slug: string;
    description?: string;
    images?: { url: string; order: number }[];
    service?: { title: string; slug: string };
  }>;

  const primaryDemo =
    demos.length === 0
      ? null
      : demos.length === 1
        ? demos[0]
        : demos.find((d) => d.slug === serviceSlug) || demos[0];

  const demo = primaryDemo;
  const images = demo?.images ? [...demo.images].sort((a, b) => a.order - b.order) : [];

  const lightboxItems = useMemo(
    () =>
      images.map((img, index) => ({
        src: normalizeImageUrl(img.url) || img.url || '',
        alt: `${demo?.title ?? 'Demo'} – demo image ${index + 1}`,
        title: demo?.title,
        description: demo?.description,
      })),
    [images, demo?.title, demo?.description],
  );

  useDocumentTitle(demo?.title ?? null);

  if (isError || (!isLoading && !demo)) {
    return (
      <div className="animate-fade-in flex min-h-[50vh] flex-col items-center justify-center px-4">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Demo not found</h1>
        <p className="mb-6 text-text-secondary">This demo could not be found or is no longer available.</p>
        <button
          onClick={() => router.push('/demos')}
          className="inline-flex items-center justify-center rounded-md bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverted hover:opacity-90"
        >
          Back to Demos
        </button>
      </div>
    );
  }

  if (isLoading || !demo) {
    return (
      <div className="animate-fade-in-up mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-56" rounded="rounded-full" />
        <Skeleton className="mt-4 h-5 w-80" rounded="rounded-full" />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" rounded="rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const serviceName = demo.service?.title || 'Demos';

  return (
    <div className="animate-fade-in demo-gallery-page" data-page="demo-gallery">
      <header className="py-16 sm:py-20 lg:py-24" aria-labelledby="gallery-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-text-secondary">
              <li>
                <Link
                  href="/demos"
                  className="rounded hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
                >
                  Demos
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/demos/${serviceSlug}`}
                  className="rounded hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
                >
                  {serviceName}
                </Link>
              </li>
            </ol>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Demo gallery</p>
          <h1 id="gallery-title" className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            {demo.title}
          </h1>
          {demo.description && <p className="mt-5 max-w-xl text-base text-text-secondary">{demo.description}</p>}
        </div>
      </header>

      <div className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {images.length === 0 ? (
            <p className="py-12 text-text-secondary">No images in this gallery yet.</p>
          ) : (
            <AnimatedSection>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((img, index) => (
                  <button
                    key={`${img.url}-${index}`}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="group relative w-full overflow-hidden rounded-xl bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                  >
                    <SmartImage
                      src={normalizeImageUrl(img.url) || img.url}
                      alt={`${demo.title} – demo image ${index + 1}`}
                      aspect="1/1"
                      rounded="xl"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="pointer-events-none"
                    />
                  </button>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxIndex >= 0 && lightboxItems.length > 0}
        onClose={() => setLightboxIndex(-1)}
        items={lightboxItems}
        index={lightboxIndex < 0 ? 0 : lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
};

export default DemoGalleryPage;
