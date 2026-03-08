# Image Rendering Debug Report

**Date:** 2025-03-06  
**Stack:** Next.js 16 (App Router), Turbopack, Express, MongoDB, next/image, DOMPurify

---

## 1. Root Cause of Disappearing Images

**Primary cause:** Relative image URLs (e.g. `/uploads/filename.jpg`) were passed to the Next.js `Image` component without normalization. Next.js requests image `src` from the **current origin** (the frontend, e.g. `localhost:3000`). Uploads are served by the **API** (e.g. `localhost:5000`). So relative `/uploads/` paths resulted in 404s and images did not render.

**Secondary causes:**
- Some pages used `coverUrl` or `imageUrl` from the API without running them through `normalizeImageUrl`, so relative paths were never turned into absolute API URLs.
- A few components still used raw `<img>` and one (Testimonials) could receive an empty `avatar` URL, leading to broken or inconsistent behavior.
- Fallback testimonial data uses `images.unsplash.com`, which was not in `next.config.mjs` `remotePatterns`, so those images would fail when using `next/image`.

**Fix strategy:** Use `normalizeImageUrl()` (or `getImageUrl()`) for **every** dynamic image URL before passing it to `<Image>`, and provide a non-empty fallback (e.g. `/logo/logo-light.png`) where the URL can be missing. Add any external image host to `images.remotePatterns`.

---

## 2. Image Flow Verification (Step 1)

| Step | Status | Notes |
|------|--------|--------|
| **Admin upload** | OK | `upload.js`: multer saves to `../uploads`, returns `url` (absolute from `getMediaUrlForFilename`) and `image` (relative `/uploads/...`) |
| **Backend storage** | OK | `backend/config/media.js`: `getMediaUrlForFilename` uses `getMediaBaseUrl(req)` or `MEDIA_BASE_URL`; `getRelativeMediaPath` returns `/uploads/{filename}` |
| **Database** | OK | APIs/store may persist relative path (`/uploads/...`) or full URL; both are handled by `resolveImageUrl` |
| **normalizeImageUrl** | OK | `frontend/utils/image.ts`: `resolveImageUrl` turns relative paths into absolute using `NEXT_PUBLIC_API_URL`; absolute URLs left unchanged (with legacy `/api/uploads/` → `/uploads/` fix); no double prefix |
| **Frontend rendering** | Fixed | All dynamic URLs now normalized before `<Image>`; fallbacks added where URL can be empty |

---

## 3. Next.js Image Config (Step 2)

**File:** `frontend/next.config.mjs`

**Verified and updated:** `images.remotePatterns` includes:

- `http://localhost:5000/uploads/**` (API uploads in dev)
- `https://picsum.photos/**`
- `https://ui-avatars.com/**`
- `https://cdn.jinubify.com/**`
- **Added:** `https://images.unsplash.com/**` (for testimonial fallback avatars)

No existing patterns were removed.

---

## 4. URL Normalization (Step 3)

**File:** `frontend/utils/image.ts` (`resolveImageUrl` / `normalizeImageUrl`)

**Behavior:**

| Input | Output |
|-------|--------|
| `''` | `''` |
| `/uploads/file.jpg` | `http://localhost:5000/uploads/file.jpg` (when `NEXT_PUBLIC_API_URL` = `http://localhost:5000/api`) |
| `http://localhost:5000/uploads/file.jpg` | Unchanged |
| `https://cdn.jinubify.com/uploads/file.jpg` | Unchanged |
| `/api/uploads/file.jpg` (legacy) | Path normalized to `/uploads/file.jpg` then prefixed with base |
| Bare `image.jpg` | Treated as `/uploads/image.jpg` then prefixed |

`getImageUrl` in `frontend/utils/getImageUrl.ts` simply calls `resolveImageUrl`. No double prefixes; base is derived from `env.apiUrl` with trailing `/api` stripped.

---

## 5. Next.js Image Props (Step 4)

All `<Image>` usages checked:

- **With `fill`:** Parent has `relative` (e.g. `relative aspect-video`, `relative aspect-[4/3]`, `relative w-full aspect-video`). No layout changes.
- **With `width`/`height`:** All have explicit dimensions (e.g. 32×32, 44×44, 56×56, 96×96, 160×40, 600×400) where applicable.
- **Fallbacks:** Public pages that can have missing/empty URLs now use `normalizeImageUrl(...) || '/logo/logo-light.png'` (or equivalent) so `src` is never empty.

---

## 6. CORS / Resource Policy (Step 5)

**File:** `backend/server.js`

Helmet is configured with:

- `crossOriginResourcePolicy: { policy: 'cross-origin' }`

So `/uploads` and other responses can be loaded from the frontend origin. No change made; no need to relax other security headers.

---

## 7. Hydration Compatibility (Step 6)

- **Header / Footer:** Auth-dependent blocks use a `mounted` flag and only show user-specific UI after client mount. Images (logo, user avatar) are not blocked by this; avatar is only rendered when `mounted && currentUser`, so no hydration mismatch.
- **Fallback images:** Using `imageUrl || '/logo/logo-light.png'` is safe for SSR: same on server and client. No `Date.now()` or `Math.random()` in image URLs.

SSR and hydration remain stable.

---

## 8. Media File Access (Step 7)

**Backend:**

- `app.use('/uploads', express.static(uploadsDir));` is present in `server.js`.
- `uploadsDir = path.join(__dirname, 'uploads')`.

So `http://localhost:5000/uploads/<filename>` is served correctly when the file exists.

---

## 9. Image Loader / unoptimized (Step 8)

- **UserDashboardPage:** `<Image ... unoptimized />` is used for user avatar (`formData.photoURL`), which can be external or data URL; `unoptimized` is acceptable here and was not removed.
- No other incorrect use of `unoptimized` found.

---

## 10. Files Modified

| File | Change |
|------|--------|
| `frontend/components/pages/DemoOverviewPage.tsx` | Import `normalizeImageUrl`. Compute `coverUrl` from `rawCover` via `normalizeImageUrl(rawCover)` so demo cover and first image URLs from API are absolute. |
| `frontend/components/pages/PortfolioPage.tsx` | Import `normalizeImageUrl`. Both `<Image>` `src` use `normalizeImageUrl(project.imageUrl) \|\| '/logo/logo-light.png'`. |
| `frontend/components/Testimonials.tsx` | Replaced `<img>` with `<Image>`, added `width={56}` `height={56}`, `src={normalizeImageUrl(current.avatar \|\| '') \|\| '/logo/logo-light.png'}`. |
| `frontend/components/pages/AboutPage.tsx` | Replaced `<img>` with `<Image>`, added `width={600}` `height={400}`, kept `normalizeImageUrl(ourStory.imageUrl \|\| '...')`. |
| `frontend/next.config.mjs` | Added `images.remotePatterns` entry for `https://images.unsplash.com/**`. |

---

## 11. Configuration Summary

- **Next.js `images`:** `remotePatterns` include localhost:5000 uploads, picsum, ui-avatars, cdn.jinubify, images.unsplash. No removals.
- **Backend:** No header or static-serving changes; `crossOriginResourcePolicy: 'cross-origin'` already set.
- **Env:** Ensure `NEXT_PUBLIC_API_URL` is set at build time (e.g. `https://api.example.com/api`) so production image URLs point to the correct API host. Optional: `NEXT_PUBLIC_MEDIA_BASE_URL` for a dedicated CDN for `/uploads/*`.

---

## 12. Verification

- **Image pipeline:** Upload → backend URL/relative path → DB → frontend normalize → `<Image>` with absolute URL (or fallback).
- **Next config:** All required hosts in `remotePatterns`; localhost uploads included.
- **Normalization:** Relative and bare filenames become absolute; no double prefix.
- **Image props:** All use `width`/`height` or `fill` with relative parent; fallbacks where URL can be empty.
- **CORS/CORP:** Backend allows cross-origin for images.
- **Hydration:** No change to mounted/auth logic; fallbacks are SSR-safe.
- **Static serving:** Express serves `/uploads`; no code change.

**Result:** All images that use dynamic (API-sourced) URLs now go through `normalizeImageUrl`/`getImageUrl` and, where needed, a fallback. This resolves disappearing images caused by relative `/uploads/` paths and empty URLs while keeping Next.js Image usage, layout, and SSR/hydration intact.
