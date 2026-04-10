/**
 * Fallback gallery data for all demo services.
 * When the backend has no demo for a given (serviceSlug, demoSlug), the gallery page
 * can still show a grid of look-alike sample images using this registry.
 */
import { labelToSlug } from './slugify';
import { servicesContent } from '../../../data/servicesContent';

const GALLERY_IMAGE_COUNT = 8;
const PICSUM = (seed: string, count: number) =>
  Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/600/600`);

function getServiceTitle(serviceSlug: string): string {
  const found = servicesContent.find((s) => s.slug === serviceSlug);
  return found?.title ?? serviceSlug.replace(/-/g, ' ');
}

/** Labels per service – must match the corresponding Visual's SUB_ITEMS so labelToSlug(label) matches link URLs */
const REGISTRY: Record<string, string[]> = {
  'social-media-management': [
    'Facebook page management',
    'Instagram page management',
    'WhatsApp Business setup',
    'Content planning & scheduling',
    'Post design & captions',
    'Social media posters & flyers',
    'Audience engagement',
    'Page optimization',
    'Performance analytics',
    'Social media captions & copywriting',
  ],
  'digital-marketing': [
    'Facebook Ads',
    'Google Ads',
    'Lead generation campaigns',
    'Marketing strategy planning',
    'Conversion optimization',
    'Analytics & reporting',
    'Search Engine Optimization (SEO)',
    'Local SEO',
    'Google Business Profile setup',
  ],
  'graphic-design-branding': [
    'Logo design',
    'Brand identity design (colors, fonts & guidelines)',
    'Brand guidelines',
    'Brand messaging support',
    'Social media graphics',
    'Flyers & posters',
    'Banners & signage',
    'Business cards',
    'Brochures & company profiles',
    'Company profiles & presentations',
    'Image editing & design',
    'Branded merchandise design',
  ],
  'mobile-app-development': [
    'Android app development',
    'iOS app development',
    'Cross-platform apps',
    'App UI/UX design',
    'App updates & maintenance',
    'App performance optimization',
  ],
  'software-development': [
    'Custom web applications',
    'Business management systems',
    'Inventory & POS systems',
    'School management systems',
    'NGO management & data/reporting systems',
    'Booking & service management systems',
    'System integrations & admin panels',
    'Custom admin dashboards / reporting tools',
  ],
  'cloud-hosting': [
    'Website hosting setup',
    'Domain registration support',
    'Cloud storage setup',
    'Email hosting & workspace setup (Google Workspace)',
    'Server configuration',
    'Data backup solutions',
    'Basic security setup (backups, HTTPS, basic hardening)',
  ],
  'printing-services': [
    'Business cards',
    'Flyers',
    'Posters',
    'Banners (indoor & outdoor)',
    'Brochures',
    'Stickers & labels',
    'Branded merchandise (T-shirts, mugs, caps)',
    'Event & promotional materials',
  ],
};

export interface FallbackGalleryResult {
  title: string;
  images: { url: string; order: number }[];
  serviceTitle: string;
}

/**
 * Returns fallback gallery data for the given service and demo slug when the API has no demo.
 * Returns null if the service is not in the registry or the demoSlug does not match any label.
 */
export function getFallbackGallery(
  serviceSlug: string | undefined,
  demoSlug: string | undefined
): FallbackGalleryResult | null {
  if (!serviceSlug || !demoSlug) return null;
  const labels = REGISTRY[serviceSlug];
  if (!labels) return null;
  const label = labels.find((l) => labelToSlug(l) === demoSlug);
  if (!label) return null;
  const basePath = `/demo-images/${serviceSlug}/${demoSlug}`;
  const localUrls = Array.from({ length: GALLERY_IMAGE_COUNT }, (_, i) => `${basePath}/${i + 1}.jpg`);

  // Prefer local demo images under public/demo-images/{serviceSlug}/{demoSlug}/1.jpg...
  // If you add those assets, they will be used automatically.
  if (localUrls.length > 0) {
    return {
      title: label,
      serviceTitle: getServiceTitle(serviceSlug),
      images: localUrls.map((url, order) => ({ url, order })),
    };
  }

  // Fallback to Picsum-style placeholders if no local images are available
  const seed = `${serviceSlug}-${demoSlug}`;
  const urls = PICSUM(seed, GALLERY_IMAGE_COUNT);
  return {
    title: label,
    serviceTitle: getServiceTitle(serviceSlug),
    images: urls.map((url, order) => ({ url, order })),
  };
}
