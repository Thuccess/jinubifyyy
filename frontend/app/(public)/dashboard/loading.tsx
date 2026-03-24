import SkeletonBlock from '@/components/skeletons/SkeletonBlock';

export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg-secondary text-text-primary flex">
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border-subtle surface surface--sidebar">
        <div className="px-6 py-5 border-b border-border-subtle">
          <SkeletonBlock className="h-3 w-28" rounded="full" />
          <SkeletonBlock className="mt-2 h-4 w-24" rounded="full" />
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-9 w-full" rounded="lg" />
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border-subtle surface surface--bar flex items-center justify-between px-4 md:px-6">
          <SkeletonBlock className="h-4 w-56" rounded="full" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-9 w-9" rounded="full" />
            <SkeletonBlock className="h-8 w-24 hidden sm:block" rounded="full" />
            <SkeletonBlock className="h-8 w-20" rounded="full" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-bg-secondary">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-20 w-full" rounded="xl" />
              ))}
            </div>
            <SkeletonBlock className="h-64 w-full" rounded="xl" />
            <SkeletonBlock className="h-64 w-full" rounded="xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

