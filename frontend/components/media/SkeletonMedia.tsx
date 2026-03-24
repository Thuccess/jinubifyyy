'use client';

import clsx from 'clsx';

const roundedMap: Record<string, string> = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export type SkeletonMediaProps = {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  visible?: boolean;
};

/**
 * Shimmer skeleton matching the media frame — sits inside an aspect-ratio wrapper.
 */
export function SkeletonMedia({
  rounded = 'xl',
  className,
  visible = true,
}: SkeletonMediaProps) {
  if (!visible) return null;

  return (
    <div
      className={clsx(
        'pointer-events-none absolute inset-0 z-20 overflow-hidden bg-transparent transition-opacity duration-300 ease-out',
        roundedMap[rounded] ?? 'rounded-xl',
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 animate-shimmer bg-[length:200%_100%]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, var(--surface-muted) 40%, var(--color-slate-400) 50%, var(--surface-muted) 60%, transparent 100%)',
          opacity: 0.4,
        }}
      />
    </div>
  );
}
