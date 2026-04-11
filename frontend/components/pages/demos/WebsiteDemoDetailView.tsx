'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { WebsiteDemo } from '@/types/websiteDemo';
import { normalizeImageUrl } from '@/utils/image';
import { toEmbeddableVideoUrl } from '@/utils/videoEmbedUrl';
import SmartImage from '@/components/media/SmartImage';
import GetThisWebsiteModal from '@/components/demo/GetThisWebsiteModal';
import { useDemoMutations } from '@/hooks/useServices';

export type DetailDevice = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<DetailDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export interface WebsiteDemoDetailViewProps {
  demo: WebsiteDemo;
}

const WebsiteDemoDetailView: React.FC<WebsiteDemoDetailViewProps> = ({ demo }) => {
  const [device, setDevice] = useState<DetailDevice>('desktop');
  const [orderOpen, setOrderOpen] = useState(false);
  const { recordWebsiteDemoClick } = useDemoMutations();
  const thumb = normalizeImageUrl(demo.thumbnail || '') || demo.thumbnail;
  const showIframe = demo.previewMode === 'iframe' && demo.demoUrl;

  const gallery = (demo.gallery || []).filter(Boolean);
  const videoEmbedSrc = useMemo(
    () => (demo.video?.trim() ? toEmbeddableVideoUrl(demo.video.trim()) : ''),
    [demo.video]
  );

  return (
    <div className="animate-fade-in pb-20" data-page="website-demo-detail">
      <header className="border-b border-border-subtle bg-[color:var(--bg-secondary)]/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {demo.isFeatured ? (
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                Featured
              </span>
            ) : null}
            {demo.category ? (
              <span className="rounded-full bg-surface-card px-2.5 py-0.5 text-xs font-medium text-text-secondary ring-1 ring-border-subtle">
                {demo.category}
              </span>
            ) : null}
            {typeof demo.views === 'number' ? (
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                {demo.views.toLocaleString()} views
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            {demo.title}
          </h1>
          {demo.shortDescription ? (
            <p className="mt-4 max-w-2xl text-lg text-text-secondary">{demo.shortDescription}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={demo.demoUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordWebsiteDemoClick.mutate(demo.slug)}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-text-inverted shadow-lg transition hover:opacity-95"
            >
              {demo.ctaPrimary || 'View Demo'}
            </Link>
            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border-subtle bg-surface-card px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-brand-primary/35 hover:bg-brand-soft/30 hover:text-brand-primary"
            >
              {demo.ctaSecondary || 'Get This Website'}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                device === d
                  ? 'bg-brand-primary text-text-inverted'
                  : 'bg-surface-muted text-text-secondary hover:text-text-primary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div
          className="mx-auto overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted shadow-lg transition-[max-width] duration-300 ease-out"
          style={{ maxWidth: deviceWidths[device] }}
        >
          {showIframe ? (
            <div className="aspect-video w-full bg-black">
              <iframe
                title={demo.title}
                src={demo.demoUrl}
                className="h-full min-h-[360px] w-full border-0 sm:min-h-[480px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          ) : thumb ? (
            <SmartImage src={thumb} alt="" aspect="16/9" rounded="none" sizesPreset="contentFull" className="w-full" />
          ) : (
            <div className="flex aspect-video items-center justify-center text-text-muted">No preview</div>
          )}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-text-primary">Overview</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
              {demo.description || demo.shortDescription || '—'}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Features</h2>
            {demo.features && demo.features.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {demo.features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-brand-primary" aria-hidden>
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-text-muted">No feature list for this demo.</p>
            )}
            {demo.price != null && Number.isFinite(demo.price) ? (
              <p className="mt-6 text-sm text-text-muted">
                From{' '}
                <span className="text-xl font-bold text-text-primary">${demo.price.toLocaleString()}</span>
              </p>
            ) : null}
          </div>
        </div>

        {gallery.length > 0 ? (
          <div className="mt-16">
            <h2 className="text-lg font-semibold text-text-primary">Gallery</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((url, i) => (
                <div key={`${url}-${i}`} className="overflow-hidden rounded-xl border border-border-subtle">
                  <SmartImage
                    src={normalizeImageUrl(url) || url}
                    alt={`${demo.title} screenshot ${i + 1}`}
                    aspect="4/3"
                    rounded="xl"
                    sizesPreset="gridThree"
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {demo.video?.trim() ? (
          <div className="mt-16">
            <h2 className="text-lg font-semibold text-text-primary">Video</h2>
            <div className="mt-6 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-border-subtle bg-black">
              <iframe
                title={`${demo.title} video`}
                src={videoEmbedSrc}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        ) : null}
      </section>

      <GetThisWebsiteModal open={orderOpen} onClose={() => setOrderOpen(false)} demo={demo} />
    </div>
  );
};

export default WebsiteDemoDetailView;
