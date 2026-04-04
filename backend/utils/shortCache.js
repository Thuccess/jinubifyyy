/**
 * Tiny in-process TTL cache for read-mostly public API payloads.
 * Reduces duplicate Mongo work under traffic (no Redis required).
 * Disabled when NODE_ENV === 'test'.
 *
 * @param {string} key
 * @param {number} ttlMs
 * @param {() => Promise<T>} factory
 * @returns {Promise<T>}
 */
const store = new Map();

/** TTL for hot public GET handlers (CMS, socials). Env: PUBLIC_API_CACHE_MS, PUBLIC_SITE_CACHE_MAX_MS */
export function getPublicReadCacheMs() {
  const cacheMaxMs = Math.min(
    600_000,
    Math.max(10_000, parseInt(process.env.PUBLIC_SITE_CACHE_MAX_MS || '300000', 10) || 300_000),
  );
  return Math.min(
    cacheMaxMs,
    Math.max(5_000, parseInt(process.env.PUBLIC_API_CACHE_MS || '60000', 10) || 60_000),
  );
}

export async function withShortCache(key, ttlMs, factory) {
  if (process.env.NODE_ENV === 'test') {
    return factory();
  }
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.exp > now) {
    return hit.val;
  }
  const val = await factory();
  store.set(key, { val, exp: now + ttlMs });
  return val;
}

/** Clear keys with a prefix (e.g. after CMS mutations). */
export function invalidateShortCachePrefix(prefix) {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}

export function invalidateCmsPublicSiteCache() {
  invalidateShortCachePrefix('cms:public:');
}

export function invalidatePublicSocialsCache() {
  invalidateShortCachePrefix('site:public:socials');
}
