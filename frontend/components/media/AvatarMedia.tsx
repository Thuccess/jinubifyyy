'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_NEXT_IMAGE_QUALITY,
  resolveImageUrl,
  shouldBypassImageOptimizer,
} from '@/utils/image';
import { pickImageQuality } from './utils';

export type AvatarMediaProps = {
  name: string;
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
  /** When false, no ring (e.g. inline in denser UI). Default true. */
  showRing?: boolean;
};

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Square avatar region with transparent frame; falls back to initials when missing/broken.
 */
export function AvatarMedia({
  name,
  src,
  alt,
  size = 40,
  className,
  priority = false,
  showRing = true,
}: AvatarMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [quality, setQuality] = useState(DEFAULT_NEXT_IMAGE_QUALITY);

  useEffect(() => {
    setQuality(pickImageQuality());
  }, []);

  const resolved = useMemo(() => {
    if (!src?.trim()) return '';
    return resolveImageUrl(src.trim());
  }, [src]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [resolved]);

  const showImage = Boolean(resolved) && !failed;
  const label = alt || name;

  return (
    <div
      className={clsx(
        'relative shrink-0 overflow-hidden bg-transparent rounded-full',
        showRing && 'ring-2 ring-[color:var(--bg-primary)]',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage && (
        <>
          {!loaded && (
            <div
              className="absolute inset-0 animate-shimmer rounded-full bg-[color-mix(in_srgb,var(--surface-muted)_70%,transparent)]"
              aria-hidden
            />
          )}
          <Image
            src={resolved}
            alt={label}
            width={size}
            height={size}
            quality={quality}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            unoptimized={shouldBypassImageOptimizer(resolved)}
            onLoadingComplete={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(true);
            }}
            className={clsx(
              'object-cover transition-[opacity,filter,transform] duration-300 ease-out',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      )}
      {(!showImage || failed) && (
        <div
          className="flex h-full w-full items-center justify-center bg-surface-muted text-[10px] font-semibold uppercase tracking-wide text-text-secondary sm:text-xs"
          aria-hidden={showImage && !failed}
        >
          {initialsFrom(name)}
        </div>
      )}
    </div>
  );
}
