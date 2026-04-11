/**
 * True for the Web Design & Development service only — used to show
 * "View Demo" / "Contact us" on service cards while other services stay minimal.
 */
export function isWebDesignDevelopmentService(item: { slug?: string; title?: string }): boolean {
  const slug = String(item.slug || '')
    .toLowerCase()
    .trim();
  const title = String(item.title || '')
    .toLowerCase()
    .trim();

  const slugMatch =
    slug === 'web-design-and-development' ||
    slug === 'website-design-and-development' ||
    slug === 'web-design-development' ||
    slug === 'web-development-and-design';

  const titleMatch =
    (title.includes('web') && title.includes('design') && title.includes('development')) ||
    (title.includes('web design') && title.includes('development'));

  return slugMatch || titleMatch;
}
