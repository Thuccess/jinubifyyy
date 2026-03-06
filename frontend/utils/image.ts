import { env } from '../config/env';

/**
 * Resolve an image URL so that:
 * - Absolute URLs are returned as-is (except for legacy /api/uploads fix)
 * - Relative URLs are prefixed with the backend origin derived from NEXT_PUBLIC_API_URL (env.apiUrl without /api)
 * - Historical /api/uploads paths are normalized to /uploads
 * - Bare filenames (e.g. "image.jpg") are treated as "/uploads/image.jpg"
 */
export const resolveImageUrl = (url: string): string => {
  if (!url) return '';

  // If already absolute, just normalize legacy /api/uploads and return
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith('/api/uploads/')) {
        u.pathname = u.pathname.replace('/api/uploads/', '/uploads/');
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

