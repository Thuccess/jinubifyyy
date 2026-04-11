'use client';

import React from 'react';
import DemoGalleryPage from '@/components/pages/DemoGalleryPage';
import WebsiteDemoDetailView from '@/components/pages/demos/WebsiteDemoDetailView';
import { useServiceBySlug, useWebsiteDemoBySlug } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';
import type { WebsiteDemo } from '@/types/websiteDemo';

interface DemosSlugRouterProps {
  slug: string;
}

const DemosSlugRouter: React.FC<DemosSlugRouterProps> = ({ slug }) => {
  const svc = useServiceBySlug(slug);
  const servicePayload = svc.data as { data?: unknown } | undefined;
  const serviceOk = Boolean(svc.isSuccess && servicePayload?.data);

  const web = useWebsiteDemoBySlug(slug, {
    enabled: Boolean(slug) && svc.isFetched && !svc.isLoading && !serviceOk,
  });
  const webPayload = web.data as { data?: WebsiteDemo } | undefined;
  const demo = webPayload?.data;

  if (svc.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-56" rounded="rounded-full" />
        <Skeleton className="mt-4 h-5 w-80" rounded="rounded-full" />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" rounded="rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (serviceOk) {
    return <DemoGalleryPage />;
  }

  if (web.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-2/3 max-w-md" rounded="rounded-lg" />
        <Skeleton className="mt-6 h-64 w-full" rounded="rounded-2xl" />
      </div>
    );
  }

  if (demo) {
    return <WebsiteDemoDetailView demo={demo} />;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Not found</h1>
      <p className="mb-6 text-center text-text-secondary">
        This demo or service could not be found.
      </p>
      <a
        href="/demos"
        className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverted hover:opacity-90"
      >
        Back to demos
      </a>
    </div>
  );
};

export default DemosSlugRouter;
