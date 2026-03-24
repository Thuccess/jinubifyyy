'use client';

import clsx from 'clsx';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { resolveImageUrl, shouldBypassImageOptimizer } from '@/utils/image';
import { SkeletonMedia } from './SkeletonMedia';
import { pickImageQuality, TRANSPARENT_PLACEHOLDER } from './utils';

const aspectClass: Record<string, string> = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
};

const roundedMap: Record<string, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export type SmartImageProps = {
  src: string;
  alt: string;
  aspect?: '1/1' | '4/3' | '16/9';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  priority?: boolean;
  sizes?: string;
  /** Default cover for photos; use contain for logos / transparent artwork. */
  objectFit?: 'cover' | 'contain';
  className?: string;
  /** Subtle bottom gradient (cards / heroes). */
  overlay?: 'none' | 'gradient-bottom';
  /** Forward compatible with extra next/image props (e.g. fetchPriority). */
  imageProps?: Partial<Omit<ImageProps, 'src' | 'alt' | 'fill' | 'sizes'>>;
};

const DEFAULT_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw';

/**
 * Aspect-ratio–locked image with skeleton, blur-in reveal, lazy load, and transparent-friendly container.
 */
export default function SmartImage({
  src,
  alt,
  aspect = '16/9',
  rounded = 'xl',
  priority = false,
  sizes = DEFAULT_SIZES,
  objectFit = 'cover',
  className,
  overlay = 'none',
  imageProps,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [quality, setQuality] = useState(75);

  useEffect(() => {
    setQuality(pickImageQuality());
  }, []);

  const resolved = useMemo(() => {
    if (!src?.trim()) return '';
    return resolveImageUrl(src.trim());
  }, [src]);

  const displaySrc = failed || !resolved ? TRANSPARENT_PLACEHOLDER : resolved;
  const unoptimized = useMemo(
    () => shouldBypassImageOptimizer(displaySrc),
    [displaySrc],
  );

  const aspectCls = aspectClass[aspect] ?? 'aspect-video';
  const roundedCls = roundedMap[rounded] ?? 'rounded-xl';

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden bg-transparent',
        aspectCls,
        roundedCls,
        'group transition-[transform,filter] duration-200 ease-out',
        'motion-reduce:transition-none',
        className,
      )}
    >
      <SkeletonMedia rounded={rounded} visible={!loaded && !failed} />

      <div
        className={clsx(
          'absolute inset-0 z-10 transition-[opacity,filter,transform] duration-300 ease-out',
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md',
          'motion-reduce:transition-none motion-reduce:blur-0',
        )}
      >
        <Image
          {...imageProps}
          src={displaySrc}
          alt={failed ? '' : alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          unoptimized={unoptimized}
          onLoadingComplete={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
          className={clsx(
            objectFit === 'contain' ? 'object-contain' : 'object-cover',
            'transition-[transform,filter] duration-200 ease-out',
            'group-hover:scale-105 group-hover:brightness-110',
            'motion-reduce:group-hover:scale-100 motion-reduce:group-hover:brightness-100',
            roundedCls,
          )}
        />
      </div>

      {overlay === 'gradient-bottom' && (
        <div
          className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-black/50 via-transparent to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
