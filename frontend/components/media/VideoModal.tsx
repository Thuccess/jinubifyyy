'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@/components/icons/Icons';
import { getYoutubeVideoId, isLikelyVideoUrl } from './utils';

export type VideoModalProps = {
  open: boolean;
  onClose: () => void;
  /** Direct .mp4/.webm URL or YouTube page/embed URL. */
  videoUrl: string;
  title?: string;
};

export default function VideoModal({
  open,
  onClose,
  videoUrl,
  title = 'Video',
}: VideoModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open || !videoUrl?.trim()) return null;

  const url = videoUrl.trim();
  const yt = getYoutubeVideoId(url);
  const isHtml5 = isLikelyVideoUrl(url) && !yt;
  const html5Src = isHtml5 ? url : null;

  const content = (
    <div
      className="fixed inset-0 z-[110] flex animate-fade-in items-center justify-center px-3 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        aria-label="Close video"
        onClick={onClose}
      />

      <div
        className={clsx(
          'relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border-card bg-[color:var(--surface-card)] shadow-2xl dark:shadow-sm animate-zoom-in',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2 sm:px-4">
          <p className="truncate text-sm font-semibold text-text-primary">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full text-text-primary transition hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {yt ? (
            <iframe
              title={title}
              src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&rel=0&playsinline=1`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : html5Src ? (
            <video
              className="absolute inset-0 h-full w-full object-contain"
              controls
              playsInline
              muted
              autoPlay
              preload="metadata"
              src={html5Src}
            />
          ) : (
            <p className="flex h-full items-center justify-center px-4 text-sm text-text-secondary">
              Unsupported video URL
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
