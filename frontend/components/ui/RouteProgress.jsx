'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { doneProgress, setupProgressBar, startProgress } from '@/lib/progress';

function RouteProgressSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setupProgressBar();
    doneProgress();
  }, [pathname, searchParams]);

  return null;
}

export default function RouteProgress() {
  useEffect(() => {
    const clickHandler = (event) => {
      const target = event.target?.closest?.('a[href]');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      const samePageHash = href.startsWith('#');
      const external = /^https?:\/\//i.test(href);
      if (samePageHash || external) return;

      startProgress();
    };

    window.addEventListener('click', clickHandler);
    return () => window.removeEventListener('click', clickHandler);
  }, []);

  return (
    <Suspense fallback={null}>
      <RouteProgressSync />
    </Suspense>
  );
}
