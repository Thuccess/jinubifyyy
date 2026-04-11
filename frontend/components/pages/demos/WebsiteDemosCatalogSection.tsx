'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { SearchIcon } from '@/components/icons/Icons';
import DemoCard from '@/components/demo/DemoCard';
import { useWebsiteDemos, useDemoMutations } from '@/hooks/useServices';
import type { WebsiteDemo } from '@/types/websiteDemo';

const BOOKMARK_KEY = 'jinubify_demo_bookmarks';

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

const WebsiteDemosCatalogSection: React.FC = () => {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  React.useEffect(() => {
    setSaved(readBookmarks());
  }, []);

  const { data, isLoading, isError, refetch } = useWebsiteDemos({
    q: q.trim() || undefined,
    category: category.trim() || undefined,
    featured: featuredOnly || undefined,
  });

  const demos = (data?.data || []) as WebsiteDemo[];

  const categories = useMemo(() => {
    const s = new Set<string>();
    demos.forEach((d) => {
      if (d.category?.trim()) s.add(d.category.trim());
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [demos]);

  const toggleSave = useCallback((slug: string) => {
    setSaved((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const { recordWebsiteDemoClick } = useDemoMutations();

  const onViewDemo = useCallback(
    (slug: string) => {
      recordWebsiteDemoClick.mutate(slug);
    },
    [recordWebsiteDemoClick]
  );

  return (
    <section className="py-10 sm:py-14" aria-labelledby="website-demos-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="website-demos-heading" className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Website demos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
              Browse live site previews. Open a quick preview overlay or jump straight into the live build.
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or description…"
              className="w-full rounded-xl border border-border-subtle bg-surface-card py-2.5 pl-10 pr-4 text-sm text-text-primary shadow-sm focus:border-border-accent focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              aria-label="Search demos"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-[44px] rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-ring)]"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-[color:var(--accent-ring)]"
              />
              Featured only
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-2xl border border-border-subtle bg-surface-muted/60"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-card p-10 text-center">
            <p className="text-text-secondary">Couldn&apos;t load demos.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-sm font-semibold text-brand-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : demos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-muted/30 p-12 text-center text-text-secondary">
            No website demos yet. Admins can publish showcases from the dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <DemoCard
                key={demo._id}
                demo={demo}
                saved={saved.includes(demo.slug)}
                onToggleSave={toggleSave}
                onViewDemoClick={onViewDemo}
                onGetThisClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WebsiteDemosCatalogSection;
