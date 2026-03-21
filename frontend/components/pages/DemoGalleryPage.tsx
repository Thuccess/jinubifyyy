 'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from '@/components/NextImage';

function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title) document.title = `${title} | Demos`;
    return () => { document.title = 'Jinubify'; };
  }, [title]);
}
import AnimatedSection from '../AnimatedSection';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '../icons/Icons';
import { useDemosByServiceSlug } from '../../hooks/useServices';
import { normalizeImageUrl } from '../../utils/image';

const Lightbox: React.FC<{
  isOpen: boolean;
  imageUrl: string;
  imageAlt: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}> = ({ isOpen, imageUrl, imageAlt, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center p-4 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-1 -right-1 z-20 p-3 text-text-inverted bg-text-primary/80 rounded-full hover:opacity-90 transition-all shadow-xl hover:scale-110 ring-2 ring-[color:var(--border-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
          aria-label="Close lightbox"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>

        <div className="relative w-full aspect-video max-h-[75vh]">
          <Image
            src={normalizeImageUrl(imageUrl) || '/logo/logo-light.png'}
            alt={imageAlt}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-contain rounded-xl shadow-2xl ring-2 ring-white/10"
          />
        </div>
      </div>

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white bg-slate-800/80 rounded-full hover:bg-slate-700/90 transition-all shadow-xl hover:scale-110 ring-2 ring-white/10"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-text-inverted bg-text-primary/80 rounded-full hover:opacity-90 transition-all shadow-xl hover:scale-110 ring-2 ring-[color:var(--border-subtle)]"
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

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

  // Prefer a demo whose slug matches the serviceSlug; otherwise use the first one.
  const primaryDemo =
    demos.length === 0
      ? null
      : demos.length === 1
      ? demos[0]
      : demos.find((d) => d.slug === serviceSlug) || demos[0];

  const demo = primaryDemo;
  const images = demo?.images ? [...demo.images].sort((a, b) => a.order - b.order) : [];
  const currentImage = lightboxIndex >= 0 && lightboxIndex < images.length ? images[lightboxIndex] : null;

  useDocumentTitle(demo?.title ?? null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex < 0) return;
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i - 1 + images.length) % images.length);
      } else if (e.key === 'Escape') {
        setLightboxIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  if (isError || (!isLoading && !demo)) {
    return (
      <div className="animate-fade-in min-h-[50vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Demo not found</h1>
        <p className="text-text-secondary mb-6">This demo could not be found or is no longer available.</p>
        <button
          onClick={() => router.push('/demos')}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-text-inverted bg-brand-primary rounded-md hover:opacity-90"
        >
          Back to Demos
        </button>
      </div>
    );
  }

  if (isLoading || !demo) {
    return (
      <div className="animate-fade-in min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary" aria-hidden="true" />
      </div>
    );
  }

  const serviceName = demo.service?.title || 'Demos';

  return (
    <div className="animate-fade-in demo-gallery-page" data-page="demo-gallery">
      <header className="py-16 sm:py-20 lg:py-24" aria-labelledby="gallery-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-text-secondary">
              <li><Link href="/demos" className="hover:text-brand-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]">Demos</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/demos/${serviceSlug}`} className="hover:text-brand-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]">{serviceName}</Link></li>
            </ol>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Demo gallery</p>
          <h1 id="gallery-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl max-w-2xl">{demo.title}</h1>
          {demo.description && <p className="mt-5 text-base text-text-secondary max-w-xl">{demo.description}</p>}
        </div>
      </header>

      <div className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {images.length === 0 ? (
            <p className="text-text-secondary py-12">No images in this gallery yet.</p>
          ) : (
            <AnimatedSection>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <button
                    key={`${img.url}-${index}`}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="aspect-square rounded-xl overflow-hidden bg-surface-muted relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                  >
                    <Image
                      src={normalizeImageUrl(img.url) || '/logo/logo-light.png'}
                      alt={`${demo.title} – demo image ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      {currentImage && (
        <Lightbox
          isOpen={lightboxIndex >= 0}
          imageUrl={currentImage.url}
          imageAlt={`${demo.title} – image ${lightboxIndex + 1}`}
          onClose={() => setLightboxIndex(-1)}
          onNext={() => setLightboxIndex((i) => (i + 1) % images.length)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
          hasNext={images.length > 1}
          hasPrev={images.length > 1}
        />
      )}
    </div>
  );
};

export default DemoGalleryPage;
