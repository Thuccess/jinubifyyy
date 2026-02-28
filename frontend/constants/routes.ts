export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PRICING: '/pricing',
  DEMOS: '/demos',
  BLOG: '/blog',
  CONTACT: '/contact',
  TEAM: '/team',
  TERMS: '/terms-of-service',
  PRIVACY: '/privacy-policy',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
} as const;

/** Demo overview for a service: /demos/:serviceSlug */
export function demosOverviewPath(serviceSlug: string): string {
  return `/demos/${serviceSlug}`;
}

/** Demo gallery for a sub-item: /demos/:serviceSlug/:demoSlug */
export function demosGalleryPath(serviceSlug: string, demoSlug: string): string {
  return `/demos/${serviceSlug}/${demoSlug}`;
}

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
