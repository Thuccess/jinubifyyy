export function logPerformance() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (!nav) return;

    // Basic, low-noise logging for key milestones
    // TTFB: time to first byte from start of navigation
    // DOM Load: DOMContentLoaded event
    // LCP can be added later via PerformanceObserver if needed
    // eslint-disable-next-line no-console
    console.log('[Perf] TTFB (ms):', Math.round(nav.responseStart));
    // eslint-disable-next-line no-console
    console.log('[Perf] DOM Load (ms):', Math.round(nav.domContentLoadedEventEnd));
  });
}

