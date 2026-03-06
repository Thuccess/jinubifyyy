import config from './index.js';

/**
 * Return the base URL for serving media assets.
 *
 * - If MEDIA_BASE_URL is defined, we always use that (suitable for CDN like https://cdn.jinubify.com)
 * - Otherwise we fall back to the backend origin derived from the incoming request
 */
export const getMediaBaseUrl = (req) => {
  const envBase = process.env.MEDIA_BASE_URL;
  if (envBase && typeof envBase === 'string' && envBase.trim()) {
    return envBase.replace(/\/$/, '');
  }

  // Fallback: current server origin (e.g. http://localhost:5000)
  const origin = `${req.protocol}://${req.get('host')}`;
  return origin.replace(/\/$/, '');
};

/**
 * Build a public URL for a stored media filename.
 * This always points at the /uploads path on the chosen base URL.
 */
export const getMediaUrlForFilename = (req, filename) => {
  const base = getMediaBaseUrl(req);
  const safeName = String(filename || '').replace(/^[\\/]+/, '');
  return `${base}/uploads/${safeName}`;
};

/**
 * Return the relative path used for storing in MongoDB when we want
 * a compact reference that can be resolved on the frontend using its
 * own environment configuration.
 */
export const getRelativeMediaPath = (filename) => {
  const safeName = String(filename || '').replace(/^[\\/]+/, '');
  return `/uploads/${safeName}`;
};

export default {
  getMediaBaseUrl,
  getMediaUrlForFilename,
  getRelativeMediaPath,
};

