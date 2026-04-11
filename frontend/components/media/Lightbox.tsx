'use client';

import clsx from 'clsx';
import Image from '@/components/NextImage';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { normalizeImageUrl } from '@/utils/image';
import { SMART_IMAGE_SIZES } from '@/components/media/imageSizes';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@/components/icons/Icons';

export type LightboxItem = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
};

export type LightboxProps = {
  open: boolean;
  onClose: () => void;
  items: LightboxItem[];
  index: number;
  onIndexChange?: (index: number) => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export default function Lightbox({
  open,
  onClose,
  items,
  index,
  onIndexChange,
}: LightboxProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeLen = items.length;
  const safeIndex =
    safeLen === 0 ? 0 : Math.max(0, Math.min(index, safeLen - 1));
  const current = safeLen > 0 ? items[safeIndex] : null;
  const hasNav = safeLen > 1;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!hasNav || !onIndexChange) return;
      const next = (safeIndex + dir + safeLen) % safeLen;
      onIndexChange(next);
      setScale(1);
    },
    [hasNav, onIndexChange, safeIndex, safeLen],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setScale(1);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, go]);

  useEffect(() => {
    if (open) setScale(1);
  }, [open, safeIndex]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
  }, []);

  const distance = (touches: { length: number; [i: number]: { clientX: number; clientY: number } }) => {
    if (touches.length < 2) return 0;
    const a = touches[0]!;
    const b = touches[1]!;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  if (!mounted) return null;
  if (!open) return null;
  if (safeLen === 0 || !current) return null;

  const src = normalizeImageUrl(current.src) || current.src;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={current.title ? titleId : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out bg-black/80 backdrop-blur-md"
        aria-label="Close lightbox"
        onClick={onClose}
      />

      <div
        ref={containerRef}
        className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col items-center px-3 py-6 sm:px-6"
        onWheel={onWheel}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            pinchStart.current = { dist: distance(e.touches), scale };
          } else if (e.touches.length === 1) {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && pinchStart.current) {
            const d = distance(e.touches);
            const ratio = d / pinchStart.current.dist;
            setScale(
              Math.min(
                MAX_SCALE,
                Math.max(MIN_SCALE, pinchStart.current.scale * ratio),
              ),
            );
          }
        }}
        onTouchEnd={(e) => {
          if (e.touches.length < 2) pinchStart.current = null;
          if (scale > 1.02) {
            touchStartX.current = null;
            return;
          }
          const startX = touchStartX.current;
          if (startX == null) return;
          const end = e.changedTouches[0]?.clientX ?? startX;
          const dx = end - startX;
          touchStartX.current = null;
          if (Math.abs(dx) > 56) {
            go(dx < 0 ? 1 : -1);
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-0 right-2 z-30 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full border border-border-card bg-[color:var(--surface-card)] text-text-primary shadow-lg dark:shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] sm:right-4"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div
          className="animate-zoom-in relative w-full max-h-[78vh] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="relative aspect-video w-full max-h-[78vh] min-h-[200px] bg-transparent sm:min-h-[280px]">
            <Image
              src={src}
              alt={current.alt}
              fill
              sizes={SMART_IMAGE_SIZES.modal}
              className="object-contain"
              priority
              quality={98}
            />
          </div>
        </div>

        {(current.title || current.description) && (
          <div
            id={titleId}
            className="mt-4 w-full max-w-3xl rounded-lg border border-border-card bg-[color:var(--surface-card)] px-4 py-3 text-left sm:px-6 sm:py-4"
          >
            {current.title && (
              <h2 className="text-lg font-bold text-text-primary sm:text-xl">
                {current.title}
              </h2>
            )}
            {current.description && (
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {current.description}
              </p>
            )}
          </div>
        )}
      </div>

      {hasNav && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className={clsx(
              'absolute left-2 top-1/2 z-20 flex h-12 w-12 min-h-[48px] min-w-[48px] -translate-y-1/2 items-center justify-center rounded-full border border-border-card bg-[color:var(--surface-card)] text-text-primary shadow-lg dark:shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] sm:left-4',
            )}
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-2 top-1/2 z-20 flex h-12 w-12 min-h-[48px] min-w-[48px] -translate-y-1/2 items-center justify-center rounded-full border border-border-card bg-[color:var(--surface-card)] text-text-primary shadow-lg dark:shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] sm:right-4"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>
        </>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
