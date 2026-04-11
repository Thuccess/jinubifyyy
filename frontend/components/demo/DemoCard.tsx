'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { WebsiteDemo } from '@/types/websiteDemo';
import { normalizeImageUrl } from '@/utils/image';
import SmartImage from '@/components/media/SmartImage';
import { ArrowRightIcon } from '@/components/icons/Icons';
import DemoPreviewModal from './DemoPreviewModal';
import GetThisWebsiteModal from './GetThisWebsiteModal';

const NEW_DAYS = 14;
const TRENDING_VIEWS = 80;

function isNewDemo(d: WebsiteDemo): boolean {
  if (!d.createdAt) return false;
  const t = new Date(d.createdAt).getTime();
  return Date.now() - t < NEW_DAYS * 86400000;
}

function isTrending(d: WebsiteDemo): boolean {
  const v = d.views ?? 0;
  const c = d.clicks ?? 0;
  return v >= TRENDING_VIEWS || c >= 25;
}

export interface DemoCardProps {
  demo: WebsiteDemo;
  saved?: boolean;
  onToggleSave?: (slug: string) => void;
  onViewDemoClick?: (slug: string) => void;
  onGetThisClick?: (slug: string) => void;
}

const DemoCard: React.FC<DemoCardProps> = ({
  demo,
  saved = false,
  onToggleSave,
  onViewDemoClick,
  onGetThisClick,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const thumb = normalizeImageUrl(demo.thumbnail || '') || demo.thumbnail;
  const badges = useMemo(() => {
    const b: { key: string; label: string; className: string }[] = [];
    if (demo.isFeatured) {
      b.push({
        key: 'featured',
        label: 'Featured',
        className: 'bg-brand-soft text-brand-primary',
      });
    }
    if (isNewDemo(demo)) {
      b.push({ key: 'new', label: 'New', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' });
    }
    if (isTrending(demo)) {
      b.push({
        key: 'trending',
        label: 'Trending',
        className: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
      });
    }
    return b;
  }, [demo]);

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
          {thumb ? (
            <SmartImage
              src={thumb}
              alt=""
              aspect="16/9"
              rounded="none"
              sizesPreset="contentFull"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">No preview</div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b.key}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${b.className}`}
              >
                {b.label}
              </span>
            ))}
            {demo.category ? (
              <span className="rounded-full bg-surface-card/90 px-2.5 py-0.5 text-[11px] font-medium text-text-primary backdrop-blur-sm">
                {demo.category}
              </span>
            ) : null}
          </div>

          {typeof demo.views === 'number' ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              {demo.views.toLocaleString()} views
            </span>
          ) : null}

          {onToggleSave ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(demo.slug);
              }}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white backdrop-blur-sm transition hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label={saved ? 'Remove from saved' : 'Save demo'}
            >
              {saved ? '♥' : '♡'}
            </button>
          ) : null}

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="pointer-events-auto min-h-[44px] min-w-[160px] rounded-xl bg-surface-card/95 px-5 py-2.5 text-sm font-semibold text-text-primary shadow-lg backdrop-blur-sm transition hover:bg-surface-card focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
            >
              Quick preview
            </button>
            <Link
              href={demo.demoUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onViewDemoClick?.(demo.slug)}
              className="pointer-events-auto min-h-[44px] min-w-[160px] rounded-xl bg-brand-primary px-5 py-2.5 text-center text-sm font-semibold text-text-inverted shadow-lg transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
            >
              Live demo
            </Link>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h2 className="text-lg font-bold tracking-tight text-text-primary line-clamp-2">{demo.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary line-clamp-2">
            {demo.shortDescription || demo.description || '—'}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Link
                href={demo.demoUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onViewDemoClick?.(demo.slug)}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-text-inverted transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)] sm:flex-none"
              >
                {demo.ctaPrimary || 'View Demo'}
              </Link>
              <button
                type="button"
                onClick={() => {
                  onGetThisClick?.(demo.slug);
                  setOrderOpen(true);
                }}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-border-subtle bg-surface-muted/80 px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand-primary/30 hover:bg-brand-soft/40 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] sm:flex-none"
              >
                {demo.ctaSecondary || 'Get This'}
              </button>
            </div>
            <Link
              href={`/demos/${demo.slug}`}
              className="group/details mx-auto inline-flex min-h-[40px] w-full max-w-xs items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-muted/40 px-4 py-2 text-xs font-semibold tracking-wide text-text-primary shadow-sm transition hover:border-brand-primary/40 hover:bg-brand-soft/35 hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] sm:w-auto"
            >
              <span>Details & gallery</span>
              <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 transition group-hover/details:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </article>

      <DemoPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        demo={demo}
        onViewLive={() => {
          onViewDemoClick?.(demo.slug);
        }}
        onGetThis={() => {
          onGetThisClick?.(demo.slug);
          setPreviewOpen(false);
          setOrderOpen(true);
        }}
      />

      <GetThisWebsiteModal open={orderOpen} onClose={() => setOrderOpen(false)} demo={demo} />
    </>
  );
};

export default DemoCard;
