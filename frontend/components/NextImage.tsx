import type { ImageProps } from 'next/image';
import SmartImage from '@/components/ui/SmartImage';

/**
 * Drop-in replacement that keeps existing imports stable while delegating
 * to SmartImage for fallback + optimizer safety.
 */
export default function Image(props: ImageProps) {
  return <SmartImage {...props} />;
}

export type { ImageProps };
