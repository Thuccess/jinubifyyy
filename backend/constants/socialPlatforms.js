/** Canonical keys for social links (QR / public profile). Keep in sync with `frontend/lib/socialPlatforms.tsx`. */

export const SOCIAL_PLATFORM_ORDER = Object.freeze([
  'facebook',
  'instagram',
  'youtube',
  'tiktok',
  'whatsapp',
  'messenger',
  'x',
  'snapchat',
  'linkedin',
  'website',
  'pinterest',
  'reddit',
  'threads',
  'telegram',
  'wechat',
]);

export const SOCIAL_PLATFORM_KEY_SET = new Set(SOCIAL_PLATFORM_ORDER);

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function normalizeSocialPlatformKey(raw) {
  const k = String(raw || '')
    .trim()
    .toLowerCase();
  if (!k) return null;
  if (k === 'twitter') return 'x';
  if (SOCIAL_PLATFORM_KEY_SET.has(k)) return k;
  return null;
}

/**
 * @param {unknown} links
 * @returns {{ platform: string; url: string }[]}
 */
export function canonicalizeSocialLinks(links) {
  if (!Array.isArray(links)) return [];
  const map = new Map();
  for (const l of links) {
    const key = normalizeSocialPlatformKey(l?.platform);
    if (!key) continue;
    const url = typeof l?.url === 'string' ? l.url.trim() : '';
    if (!url) continue;
    map.set(key, { platform: key, url });
  }
  return SOCIAL_PLATFORM_ORDER.filter((k) => map.has(k)).map((k) => map.get(k));
}
