'use client';

import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { shouldBypassImageOptimizer } from '@/utils/image';

const PLACEHOLDER_SRC = '/search-engine-logo.png';

/**
 * Smart image wrapper:
 * - falls back once on failure
 * - prevents infinite retry loops
 * - keeps Next Image optimizations when safe
 */
export default function SmartImage({
  src,
  alt,
  onError,
  unoptimized,
  ...rest
}: ImageProps) {
  const baseSrc = typeof src === 'string' ? src : '';
  const [hasFallback, setHasFallback] = useState(false);
  const resolvedSrc =
    hasFallback || !baseSrc ? PLACEHOLDER_SRC : (src as ImageProps['src']);
  const effectiveSrc = typeof resolvedSrc === 'string' ? resolvedSrc : '';

  const finalUnoptimized = useMemo(
    () => unoptimized ?? shouldBypassImageOptimizer(effectiveSrc),
    [unoptimized, effectiveSrc],
  );

  return (
    <Image
      {...rest}
      src={resolvedSrc}
      alt={alt}
      unoptimized={finalUnoptimized}
      onError={(event) => {
        onError?.(event);
        if (!hasFallback && effectiveSrc !== PLACEHOLDER_SRC) {
          setHasFallback(true);
        }
      }}
    />
  );
}
