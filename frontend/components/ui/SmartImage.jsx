'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { shouldBypassImageOptimizer } from '@/utils/image';

const PLACEHOLDER_SRC = '/search-engine-logo.png';

/**
 * Smart image wrapper:
 * - falls back once on failure
 * - prevents infinite retry loops
 * - keeps Next Image optimizations when safe
 */
export default function SmartImage({ src, alt, onError, unoptimized, ...rest }) {
  const baseSrc = typeof src === 'string' ? src : '';
  const [hasFallback, setHasFallback] = useState(false);
  const resolvedSrc = hasFallback || !baseSrc ? PLACEHOLDER_SRC : src;
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

