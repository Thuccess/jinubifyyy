/**
 * Site-wide config for SEO (structured data, meta).
 * Override via NEXT_PUBLIC_SITE_URL etc. when needed.
 */
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jinubify.com';

export const siteConfig = {
  name: 'Jinubify',
  description:
    'Jinubify delivers modern digital solutions—web development, branding, and digital marketing—to help businesses grow.',
  url: baseUrl,
  logo: `${baseUrl}/logo/logo-light.png`,
  sameAs: [
    process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '',
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || '',
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
  ].filter(Boolean),
} as const;

export function getSiteUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://jinubify.com';
}
