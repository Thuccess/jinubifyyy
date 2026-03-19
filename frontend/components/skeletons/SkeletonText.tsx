'use client';

import React from 'react';
import SkeletonBlock from './SkeletonBlock';

type SkeletonTextProps = {
  lines?: number;
  className?: string;
  lineClassName?: string;
};

export default function SkeletonText({
  lines = 3,
  className = '',
  lineClassName = '',
}: SkeletonTextProps) {
  const safeLines = Math.max(1, Math.min(8, lines));
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: safeLines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={[
            'h-3',
            i === 0 ? 'w-11/12' : i === safeLines - 1 ? 'w-7/12' : 'w-full',
            i === 0 ? '' : 'mt-2',
            lineClassName,
          ].join(' ')}
          rounded="full"
        />
      ))}
    </div>
  );
}

