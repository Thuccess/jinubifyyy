/**
 * `sizes` hints for `next/image` — map rendered layout width to requested pixel widths
 * so small screens minimize bytes and large screens maximize clarity without over-fetching.
 *
 * @see https://nextjs.org/docs/app/api-reference/components/image#sizes
 */

export const SMART_IMAGE_SIZES = {
  /** True full-bleed (100% viewport width). */
  viewport: '100vw',

  /**
   * Full width of Jinubify’s main column (`max-w-7xl` ≈ 1280px), including padding slack.
   * Caps the final clause so ultrawide monitors don’t request unnecessary 4K-wide derivatives.
   */
  contentFull:
    '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1280px) 100vw, 1280px',

  /**
   * `md:grid-cols-2 lg:grid-cols-3` inside max-w-7xl (blog, overview cards).
   */
  gridThree:
    '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 420px',

  /**
   * `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (gallery, portfolio).
   */
  gridFour:
    '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 300px',

  /**
   * Lightbox / fullscreen preview: scales with viewport, capped near `max-w-6xl` (~1152px).
   */
  modal:
    '(max-width: 640px) 100vw, (max-width: 1024px) 92vw, (max-width: 1536px) 88vw, 1152px',
} as const;

export type SmartImageSizesPreset = keyof typeof SMART_IMAGE_SIZES;

export function resolveSmartImageSizes(
  preset: SmartImageSizesPreset | undefined,
  explicitSizes?: string,
): string {
  const trimmed = explicitSizes?.trim();
  if (trimmed) return trimmed;
  const key = preset ?? 'gridThree';
  return SMART_IMAGE_SIZES[key] ?? SMART_IMAGE_SIZES.gridThree;
}
