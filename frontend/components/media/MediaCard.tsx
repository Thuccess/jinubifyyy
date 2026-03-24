'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

export type MediaCardProps = {
  children: ReactNode;
  className?: string;
  /** Optional dark gradient at bottom (hero-style cards). */
  gradientOverlay?: boolean;
};

/**
 * Top media slot for cards — transparent shell, optional overlay; use with `SmartImage`.
 */
export function MediaCardFrame({
  children,
  className,
  gradientOverlay = false,
}: MediaCardProps) {
  return (
    <div
      className={clsx('relative w-full overflow-hidden bg-transparent', className)}
    >
      {children}
      {gradientOverlay && (
        <div
          className="pointer-events-none absolute inset-0 z-[25] bg-gradient-to-t from-black/45 via-transparent to-transparent"
          aria-hidden
        />
      )}
    </div>
  );
}
