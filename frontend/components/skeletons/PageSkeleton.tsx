'use client';

import SkeletonAvatar from './SkeletonAvatar';
import SkeletonBlock from './SkeletonBlock';
import SkeletonText from './SkeletonText';

type PageSkeletonProps = {
  compact?: boolean;
};

export default function PageSkeleton({ compact = false }: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonAvatar size={36} />
            <SkeletonBlock className="h-5 w-36" rounded="full" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-9 w-20" rounded="xl" />
            <SkeletonBlock className="h-9 w-24" rounded="xl" />
          </div>
        </div>

        <div className="mb-6">
          <SkeletonBlock className="h-8 w-56" rounded="xl" />
          <SkeletonText className="mt-3 max-w-2xl" lines={2} />
        </div>

        {!compact && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SkeletonBlock className="h-28 w-full" rounded="xl" />
            <SkeletonBlock className="h-28 w-full" rounded="xl" />
            <SkeletonBlock className="h-28 w-full" rounded="xl" />
          </div>
        )}

        <div className="rounded-2xl border border-border-subtle bg-[color:var(--surface-card)] p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <SkeletonAvatar size={44} />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-40" rounded="full" />
              <SkeletonBlock className="mt-2 h-3 w-28" rounded="full" />
            </div>
          </div>
          <SkeletonText lines={compact ? 4 : 6} />
        </div>
      </div>
    </div>
  );
}

