'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { WebsiteDemo } from '@/types/websiteDemo';
import { normalizeImageUrl } from '@/utils/image';
import SmartImage from '@/components/media/SmartImage';
import Modal from '@/components/admin/Modal';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<PreviewDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export interface DemoPreviewModalProps {
  open: boolean;
  onClose: () => void;
  demo: WebsiteDemo;
  onViewLive?: () => void;
  onGetThis?: () => void;
}

const DemoPreviewModal: React.FC<DemoPreviewModalProps> = ({
  open,
  onClose,
  demo,
  onViewLive,
  onGetThis,
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const thumb = normalizeImageUrl(demo.thumbnail || '') || demo.thumbnail;
  const showIframe = demo.previewMode === 'iframe' && demo.demoUrl;

  const previewBlock = useMemo(() => {
    if (showIframe) {
      return (
        <div
          className="mx-auto w-full overflow-hidden rounded-xl border border-border-subtle bg-surface-muted shadow-inner transition-[max-width] duration-300 ease-out"
          style={{ maxWidth: deviceWidths[device] }}
        >
          <div className="aspect-video w-full bg-black/5">
            <iframe
              title={demo.title}
              src={demo.demoUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      );
    }
    return (
      <div
        className="mx-auto overflow-hidden rounded-xl border border-border-subtle bg-surface-muted transition-[max-width] duration-300 ease-out"
        style={{ maxWidth: deviceWidths[device] }}
      >
        {thumb ? (
          <SmartImage
            src={thumb}
            alt=""
            aspect="16/9"
            rounded="xl"
            sizesPreset="contentFull"
            className="w-full"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-text-muted">No preview image</div>
        )}
      </div>
    );
  }, [demo.demoUrl, demo.title, device, showIframe, thumb]);

  return (
    <Modal isOpen={open} onClose={onClose} title={demo.title} size="lg">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
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
          {previewBlock}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">About</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {demo.shortDescription || demo.description || '—'}
            </p>
          </div>
          {demo.features && demo.features.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Highlights</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
                {demo.features.slice(0, 8).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-auto flex flex-col gap-2 pt-2">
            <Link
              href={demo.demoUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onViewLive}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-primary px-4 py-2.5 text-center text-sm font-semibold text-text-inverted transition hover:opacity-95"
            >
              View live
            </Link>
            <button
              type="button"
              onClick={() => onGetThis?.()}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-border-subtle bg-surface-muted/80 px-4 py-2.5 text-center text-sm font-semibold text-text-primary transition hover:border-brand-primary/30 hover:bg-brand-soft/40 hover:text-brand-primary"
            >
              {demo.ctaSecondary || 'Get this website'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DemoPreviewModal;
