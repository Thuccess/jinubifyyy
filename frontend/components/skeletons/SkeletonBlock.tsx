'use client';

import React from 'react';

type SkeletonBlockProps = {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  style?: React.CSSProperties;
};

const roundedClass: Record<NonNullable<SkeletonBlockProps['rounded']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export default function SkeletonBlock({ className = '', rounded = 'md', style }: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={[
        'relative overflow-hidden',
        roundedClass[rounded],
        // Base neutral blocks (light + dark)
        'bg-slate-200/80 dark:bg-slate-700/50',
        // Subtle shimmer overlay
        'before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)]',
        'dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]',
        'before:animate-[jinubify-shimmer_1.25s_ease-in-out_infinite]',
        className,
      ].join(' ')}
    />
  );
}

