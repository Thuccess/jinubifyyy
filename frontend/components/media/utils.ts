/**
 * Parse a YouTube watch/embed/short URL into a video id.
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed, 'https://example.com');
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }
    if (u.pathname.startsWith('/embed/')) {
      const id = u.pathname.replace('/embed/', '').split('/')[0];
      return id || null;
    }
    if (u.searchParams.has('v')) {
      return u.searchParams.get('v');
    }
  } catch {
    const m = trimmed.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
    );
    return m?.[1] ?? null;
  }
  return null;
}

export function isLikelyVideoUrl(url: string): boolean {
  if (!url) return false;
  return (
    /\.(mp4|webm|ogg)(\?|$)/i.test(url) ||
    /youtube\.com|youtu\.be/i.test(url)
  );
}

/** Heuristic for Connection API / save-data — returns a lower next/image quality when slow. */
export function pickImageQuality(): number {
  if (typeof navigator === 'undefined') return 75;
  try {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    if (nav.connection?.saveData) return 50;
    const t = nav.connection?.effectiveType;
    if (t === 'slow-2g' || t === '2g') return 45;
    if (t === '3g') return 60;
  } catch {
    // ignore
  }
  return 75;
}

export const TRANSPARENT_PLACEHOLDER = '/media/transparent-placeholder.svg';
