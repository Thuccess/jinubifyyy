/**
 * Set Cache-Control header for public read-only API responses.
 * Use on GET handlers for data that can be cached by browsers/CDNs.
 * Admin and mutation endpoints should NOT use this.
 */
const CACHE_PUBLIC = 'public, max-age=300, stale-while-revalidate=86400';

export const setPublicCache = (req, res, next) => {
  res.set('Cache-Control', CACHE_PUBLIC);
  next();
};

export default setPublicCache;
