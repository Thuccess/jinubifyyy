import NextImage, { type ImageProps } from 'next/image';
import { shouldBypassImageOptimizer } from '@/utils/image';

/**
 * Drop-in replacement for next/image that skips Vercel optimization for API upload URLs
 * (e.g. Render /uploads/*) to avoid 502 Bad Gateway from the image optimizer.
 */
export default function Image(props: ImageProps) {
  const src = typeof props.src === 'string' ? props.src : '';
  const unoptimized = props.unoptimized ?? shouldBypassImageOptimizer(src);
  return <NextImage {...props} unoptimized={unoptimized} />;
}

export type { ImageProps };
