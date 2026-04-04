'use client';

import React from 'react';

/**
 * Shared skeleton primitives with subtle shimmer for premium loading states.
 * Reusable across sections to avoid duplicated placeholder markup.
 */
export function Skeleton({ className = '', rounded = 'rounded-xl', style = undefined }) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`relative overflow-hidden ${rounded} bg-slate-200/80 dark:bg-slate-700/50 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[jinubify-shimmer_1.6s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]" />
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className = '' }) {
  return <Skeleton className={className} rounded="rounded-full" style={{ width: size, height: size }} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  const safeLines = Math.max(1, Math.min(lines, 8));
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: safeLines }).map((_, i) => (
        <Skeleton
          key={i}
          rounded="rounded-full"
          className={`h-3 ${i === 0 ? 'w-11/12' : i === safeLines - 1 ? 'w-7/12' : 'w-full'} ${i > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-xl border border-border-card bg-[color:var(--surface-card)] p-5 ${className} shadow-card`} aria-hidden="true">
      <Skeleton className="h-40 w-full" rounded="rounded-lg" />
      <Skeleton className="mt-4 h-5 w-2/3" rounded="rounded-full" />
      <SkeletonText lines={3} className="mt-3" />
      <div className="mt-5 flex gap-3">
        <Skeleton className="h-9 w-28" rounded="rounded-xl" />
        <Skeleton className="h-9 w-24" rounded="rounded-xl" />
      </div>
    </div>
  );
}

