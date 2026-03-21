import { env, isProduction } from '../config/env';

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

  // If this looks like just a filename (no slash and no explicit /uploads),
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
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const u = new URL(src);
    if (!u.pathname.startsWith('/uploads/')) return false;

    if (u.hostname.endsWith('.onrender.com')) return true;

    const apiBase = (env.apiUrl || '').trim().replace(/\/api\/?$/, '');
    if (apiBase) {
      const api = new URL(apiBase.startsWith('http') ? apiBase : `https://${apiBase}`);
      if (u.hostname === api.hostname) return true;
    }

    const media = (env.mediaBaseUrl || '').trim();
    if (media) {
      const m = new URL(media.startsWith('http') ? media : `https://${media}`);
      if (u.hostname === m.hostname) return true;
    }
    return false;
  } catch {
    return false;
  }
}

