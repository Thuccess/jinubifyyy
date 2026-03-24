'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { doneProgress, setupProgressBar, startProgress } from '@/lib/progress';

export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setupProgressBar();
    // Route completed when pathname/search updates.
    doneProgress();
  }, [pathname, searchParams]);

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

  return null;
}

