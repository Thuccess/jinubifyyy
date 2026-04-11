import { env, isProduction } from '../config/env';

/**
 * Default `quality` for `next/image` when the prop is omitted.
 * Applied by `@/components/NextImage` (ui SmartImage) across the app.
 * When `unoptimized` is true (e.g. many `/uploads/` URLs), Next.js ignores `quality`.
 */
export const DEFAULT_NEXT_IMAGE_QUALITY = 88;

/**
 * Resolve an image URL so that:
 * - Absolute URLs are returned as-is (except for legacy /api/uploads fix)
 * - Relative URLs are prefixed with the backend origin derived from NEXT_PUBLIC_API_URL (env.apiUrl without /api)
 * - Historical /api/uploads paths are normalized to /uploads
 * - Bare filenames (e.g. "image.jpg") are treated as "/uploads/image.jpg"
 */
export const resolveImageUrl = (url: string): string => {
  if (!url) return '';

  // If already absolute, normalize legacy /api/uploads and, in production,
  // rewrite any leftover localhost URLs to the configured media/API origin.
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith('/api/uploads/')) {
        u.pathname = u.pathname.replace('/api/uploads/', '/uploads/');
      }

      // In production, avoid shipping absolute localhost URLs by rewriting
      // them to the configured media base URL or API origin.
      if (isProduction && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
        const baseCandidate = (env.mediaBaseUrl || env.apiUrl || '').trim();
        if (baseCandidate) {
          try {
            const target = new URL(baseCandidate);
            // If NEXT_PUBLIC_API_URL includes /api, strip it from the path so
            // that uploads live at the root of the backend origin.
            if (target.pathname.startsWith('/api/')) {
              target.pathname = target.pathname.replace('/api/', '/');
            } else if (target.pathname === '/api') {
              target.pathname = '/';
            }

            u.protocol = target.protocol;
            u.hostname = target.hostname;
            u.port = target.port;
          } catch {
            // If rewriting fails, fall back to the original absolute URL.
          }
        }
      }
      return u.toString();
    } catch {
      return url;
    }
  }

  // Derive backend origin from NEXT_PUBLIC_API_URL (env.apiUrl), which is usually .../api
  let base = env.apiUrl;
  // Strip trailing /api or /api/ if present
  base = base.replace(/\/api\/?$/, '');

  const apiPrefix = base.endsWith('/') ? base.slice(0, -1) : base;
  let path = url.startsWith('/') ? url : `/${url}`;

  // Legacy: "/photo.jpg" hit the API origin root; uploads are under /uploads.
  if (
    /^\/[^/]+\.(jpe?g|png|webp|gif|svg|avif)$/i.test(path) &&
    !path.startsWith('/uploads/')
  ) {
    path = `/uploads${path}`;
  }

  // If this looks like just a filename (no slash and no explicit /uploads/),
  // treat it as an uploads path.
  if (!url.includes('/') && !url.startsWith('/uploads/')) {
    path = `/uploads/${url}`;
  }

  // Also fix legacy /api/uploads in relative form
  const normalizedPath = path.startsWith('/api/uploads/')
    ? path.replace('/api/uploads/', '/uploads/')
    : path;

  // If a dedicated media base URL is configured on the frontend, prefer it
  // for /uploads/* paths. This allows serving images from a CDN while the API
  // continues to live on a different origin.
  const baseForUploads =
    env.mediaBaseUrl && normalizedPath.startsWith('/uploads/')
      ? env.mediaBaseUrl.replace(/\/$/, '')
      : apiPrefix;

  return `${baseForUploads}${normalizedPath}`;
};

// Backwards-compatible alias used elsewhere in the codebase.
export const normalizeImageUrl = resolveImageUrl;

/**
 * When true, use next/image with unoptimized so the browser loads the URL directly.
 * Vercel's /_next/image proxy often returns 502 when fetching Render /uploads (cold start,
 * slow TLS, timeouts) even though remotePatterns allow the host.
 */
export function shouldBypassImageOptimizer(src: string): boolean {
  if (!src || typeof src !== 'string') return false;

  // Any backend /uploads asset should bypass Next optimizer.
  // This avoids optimizer amplification when files are missing or slow.
  if (src.includes('/uploads/')) return true;

  // If the caller passed a relative path like `/uploads/foo.webp`,
  // decide based on the configured backend origin.
  if (src.startsWith('/uploads/')) {
    const apiBase = (env.apiUrl || '').trim().replace(/\/api\/?$/, '');
    const mediaBase = (env.mediaBaseUrl || '').trim();
    const candidates = [apiBase, mediaBase].filter(Boolean);

    for (const candidate of candidates) {
      try {
        const u = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
        if (u.hostname.includes('onrender.com')) return true;
      } catch {
        // ignore parse errors, try next candidate
      }
    }
  }

  return false;
}
