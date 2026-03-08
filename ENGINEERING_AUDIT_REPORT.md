# Full-Stack Technical Audit Report — Jinubify

**Audit date:** March 2026  
**Stack:** Next.js (App Router), Express.js, MongoDB  
**Scope:** Project structure, frontend performance, backend API, database, media, SEO, admin, analytics, scheduling, security, code quality.

---

## PART 1 — PROJECT STRUCTURE AUDIT

### Frontend structure

| Area | Status | Notes |
|------|--------|------|
| `frontend/app` | ✅ | App Router used; route groups `(public)` and `(admin)` correctly separate public vs admin. |
| `frontend/components` | ✅ | Logical split: `pages/`, `layout/`, `admin/`, `sections/`, `seo/`, `ui/`, `icons/`. |
| `frontend/services` | ✅ | Single `api.ts` for API client; clear. |
| `frontend/utils` | ✅ | Helpers (e.g. `image`, `errorHandler`) present. |
| `frontend/contexts` | ✅ | Auth, Theme, Cms; no circular dependency observed. |
| `frontend/config` | ✅ | `env.ts`, `site.ts` for config. |

### Admin routes verified

All expected admin routes exist under `app/(admin)/admin/`:

- `/admin` (dashboard), `/admin/blog`, `/admin/services`, `/admin/pricing`, `/admin/orders`, `/admin/users`, `/admin/activity`, `/admin/media`, `/admin/analytics`
- Plus: `/admin/content`, `/admin/demos`, `/admin/testimonials`, `/admin/about`, `/admin/team`, `/admin/contacts`, `/admin/applications`, `/admin/investors`, `/admin/requests`, `/admin/settings`

All use App Router correctly: each has a `page.tsx` that imports a client page component (with `'use client'` in the component file, not necessarily in the route file).

### Issues flagged

1. **Duplicate `'use client'`** — `frontend/components/ScrollToTopButton.tsx` had two `'use client'` directives. **Fixed:** one removed.
2. **Possible legacy entry** — `frontend/App.tsx` contains lazy-loaded routes and may be legacy if the app is fully on App Router; confirm whether this file is still used by the active entry (e.g. `app/layout.tsx` or root layout).
3. **No duplicate components or circular imports** detected in the scanned structure.
4. **Placement** — `AdminDashboardPage` lives under `components/pages/` while other admin pages are under `components/pages/admin/`; inconsistent but not incorrect.

---

## PART 2 — FRONTEND PERFORMANCE AUDIT

### 1. Server vs client components

- **App route `page.tsx` files:** Do not use `'use client'`; they are server components that render client page components. ✅
- **Client components:** `'use client'` appears only in components that need state, hooks, or browser APIs (e.g. `useState`, `useEffect`, `useRouter`, `useAuth`, event handlers). This is appropriate.
- **Pages that could theoretically be server components:** Most public “content” pages (e.g. FAQ, Technologies) are already server components at the route level; they delegate to client components (e.g. `CmsBasicPage`, `TechnologiesPage`) for interactivity or CMS fetching. No change recommended without a concrete performance need.

**Conclusion:** No unnecessary `'use client'` at the route level. Client boundaries are in the right place.

### 2. Bundle size risks

- **Dependencies:** `recharts` is used only on the admin analytics page; consider dynamic import for that page to avoid loading charts on the rest of the app.
- **Large deps:** `axios`, `@tanstack/react-query`, `react-icons` are used app-wide; acceptable for this stack.
- **Unused imports:** Not fully audited; recommend running a lint/IDE check for unused imports.
- **Duplicate libs:** No duplicate UI/chart libraries found.

### 3. Image optimization

- **Next.js `Image`:** Used in BlogPage, PortfolioPage, DemoOverviewPage (and likely others). ✅
- **Raw `<img>`:** Still used in: Footer, Header, Hero, Growth, TeamPage, UserDashboardPage, admin TeamManagement, admin UserManagement. These could be migrated to `next/image` for consistency and optimization (sizing, lazy loading, format).
- **Alt text:** Previously improved across Blog, Portfolio, Team, admin sections; remaining `<img>` usages should be checked for meaningful `alt`.
- **next.config.mjs:**  
  - `images.domains`: Present but **deprecated** in Next.js 14+; `remotePatterns` is already used. Recommend removing `domains` and relying on `remotePatterns` (localhost, cdn.jinubify.com, picsum.photos, ui-avatars.com) to avoid future breakage.
- **Lazy loading:** Some `<img>` use `loading="lazy"`; `next/image` would standardize this.

---

## PART 3 — BACKEND API AUDIT

### REST structure and key routes

| Endpoint area | Structure | Notes |
|---------------|-----------|--------|
| `/api/blogs` | GET list, featured, category, tag, by slug | RESTful, public. |
| `/api/blog` | GET list/slug, POST, PUT, PATCH, DELETE | RESTful; list/slug public with optional auth. |
| `/api/services` | GET list, with-demos, by-slug; admin CRUD after middleware | ✅ |
| `/api/testimonials` | GET | ✅ |
| `/api/cms` | GET /site | ✅ |
| `/api/admin/*` | Many GET/POST/PUT/PATCH/DELETE | All behind `requireAdmin` or role-specific middleware. |
| `/api/admin/media` | GET, PATCH /:id/tags, DELETE /:id | ✅ |
| `/api/admin/analytics` | GET | ✅ |

### Caching headers

- Public GETs set: `Cache-Control: public, max-age=300, stale-while-revalidate=86400` on:
  - `blog.js` (GET `/`, GET `/:slug`)
  - `blogsPublic.js` (all GETs)
  - `services.js` (GET `/`, `/with-demos`, `/by-slug/:slug`)
  - `testimonials.js` (GET `/`)
  - `cms.js` (GET `/site`)
- Admin endpoints correctly do **not** set public caching.

### Validation, responses, errors

- **Validation:** express-validator used in auth, blog, contact, orders, services, pricing, career, investment, users, demos, briefs, assets. Some admin handlers (e.g. testimonials, about, team) accept JSON without explicit validation; consider adding for critical fields.
- **Response format:** Generally consistent: `res.json({ data | message | ... })`; pagination uses `page`, `limit`, `total`, `pages`.
- **Status codes:** 200/201 for success, 400 for validation, 401/403 for auth, 404 for missing resource, 500 for server errors. Appropriate.
- **Error handling:** Routes use try/catch and `res.status(500).json(...)`; no global error middleware audit in this pass.

### Security

- **Authentication:** `authenticate`, `requireAdmin`, `requireCmsEditor`, `authorizeRole` used; admin router uses `requireAdmin`; users/settings use `authorizeRole('super_admin')`.
- **Input:** `mongoSanitizeMiddleware` applied globally in server.js; upload uses extension allowlist and MIME check (image only), 5MB limit.
- **File upload:** Extension restricted to `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`; filename is generated (no user-controlled path). No path traversal or executable upload observed.

---

## PART 4 — DATABASE SCHEMA AUDIT

### Models verified

| Model | Key fields | Indexes | Notes |
|-------|------------|---------|--------|
| **User** | name, email, password, role, photoURL, ... | email | `role` enum: user, editor, admin, super_admin. ✅ |
| **BlogPost** | slug, title, content, status, scheduledAt, ... | slug, published, status, category, tags, date, featured, status+scheduledAt | `scheduledAt` and status `scheduled` present. ✅ |
| **Service** | title, slug, description, ... | slug, category | ✅ |
| **Order** | serviceName, status, customer, order, createdAt | userId, status, createdAt, order.serviceSlug | ✅ |
| **MediaAsset** | filename, url, tags, usedBy, createdAt | filename, createdAt, tags+createdAt | Matches audit spec. ✅ |
| **Activity** | userId, type, action, entityType, entityId, description, createdAt | userId, createdAt, entityType, createdAt+entityType | ✅ |

### Schema issues

- **Order.js:** Lines 63–66: `briefId`, `assetIds`, `orderTimestamp` are nested inside the `order` subdocument. If they are intended as top-level fields, the schema is incorrect; if they are part of `order`, indentation is misleading. Recommend a quick structural review.

---

## PART 5 — MEDIA SYSTEM AUDIT

- **Admin page:** `/admin/media` exists and is wired (AdminMediaPage). ✅
- **APIs:**  
  - GET `/api/admin/media` — pagination, search, tag, sort. ✅  
  - PATCH `/api/admin/media/:id/tags` — body validation. ✅  
  - DELETE `/api/admin/media/:id` — checks usage, deletes file and record. ✅  
- **Upload:** POST `/api/upload` uses multer; creates MediaAsset record; returns `url`, `filename`, `image` (relative). ✅
- **Uploads folder:** Server serves `uploads` and DELETE removes file from same path; no orphan-file cleanup job found (medium: consider periodic sync or cleanup).
- **CDN:** `config/media.js` uses `MEDIA_BASE_URL` and `getMediaUrlForFilename`; frontend has `NEXT_PUBLIC_MEDIA_BASE_URL`. CDN-ready. ✅

---

## PART 6 — SEO AUDIT

- **robots.ts:** Present; allows `*`, allows `/`, sitemap URL `https://jinubify.com/sitemap.xml`. ✅
- **sitemap.ts:** Static list of key URLs (home, about, services, blog, contact, etc.); does not include dynamic blog post or service slugs (low: consider dynamic sitemap for blog/services).
- **Metadata:** Public pages use `metadata` export (title, description) where checked. ✅
- **JSON-LD:**  
  - Homepage: Organization schema (StructuredData + siteConfig). ✅  
  - Blog post: Article schema (StructuredData in BlogPostPage). ✅  
  - Services: Service schema (StructuredData in ServiceDetailPage). ✅  
- **Titles/descriptions:** Set per page. ✅  
- **Alt text:** Addressed in prior work; remaining raw `<img>` should be reviewed for alt.

---

## PART 7 — ADMIN DASHBOARD AUDIT

- **Layout:** AdminLayout, AdminSidebar, AdminTopbar exist and are used. ✅
- **Pages:** Dashboard, Blog, Services, Pricing, Orders, Users, Activity, Media, Analytics, Content, Demos, Testimonials, About, Team, Contacts, Applications, Investors, Requests, Settings — all have routes and components. ✅
- **Tables:** Admin tables use pagination (e.g. AdminActivityPage, contacts, orders); bulk actions exist (blog, services, pricing, orders, users); search/filters present (e.g. activity, contacts, global search). ✅
- **Role-based UI:** Sidebar filters by `allowedRoles` (editor, admin, super_admin); Users and Settings only for super_admin; editors see Dashboard, Content, Blog. AdminGuard allows editor, admin, super_admin. ✅

---

## PART 8 — ANALYTICS SYSTEM AUDIT

- **Page:** `/admin/analytics` exists (AdminAnalyticsPage). ✅
- **API:** GET `/api/admin/analytics` with optional `days` (7–90); returns traffic, leads, conversions, topServices, topBlogPosts. ✅
- **Charts:** Line (traffic), Bar (leads, conversions), Pie (service popularity), list (top blog posts). Implemented with recharts. ✅
- **Queries:** Use Mongo aggregation ($match by date, $group by day or serviceName, $sort, $limit). ✅
- **Indexes:** Activity.createdAt, Contact.createdAt, Order.createdAt (and related) support the aggregations. ✅

---

## PART 9 — CONTENT SCHEDULING AUDIT

- **BlogPost:** `scheduledAt` (Date) and status `scheduled` exist. Pre-save keeps scheduled posts unpublished. ✅
- **Cron:** `backend/jobs/publishScheduledPosts.js` runs every 5 minutes; updates posts with `status: 'scheduled'` and `scheduledAt <= now` to `published` and `status: 'published'`. ✅
- **Registration:** `startPublishScheduledPostsJob()` called from server after DB connect (skipped in test). ✅

---

## PART 10 — SECURITY AUDIT

- **XSS:** Blog post content is rendered with `dangerouslySetInnerHTML` (BlogPostPage). Content is admin-authored; risk is limited but present. Consider server-side sanitization (e.g. DOMPurify) for stored HTML. StructuredData JSON-LD uses `dangerouslySetInnerHTML` for script content; content is server-controlled, low risk.
- **File upload:** Extension and MIME restricted; size limit; generated filenames. No path traversal. ✅
- **Auth:** Admin and role-protected routes use middleware; no open admin write endpoints found. ✅
- **Sensitive data:** Passwords not returned (select: false); tokens in headers. ✅
- **Logging:** Some routes log errors with `console.error`; ensure no sensitive payloads are logged in production.

---

## PART 11 — CODE QUALITY AUDIT

- **Duplicate logic:** Shared patterns (pagination, API client) centralized; no major duplication flagged.
- **Dead code:** `frontend/App.tsx` may be legacy if app is fully on App Router; confirm usage.
- **console.log:** Present in server.js (startup, DB), scripts, cron job, some routes (e.g. investment, career, orders). Acceptable for ops; ensure no PII in logs.
- **Unused imports:** Not fully audited; recommend lint/IDE pass.
- **Naming:** Consistent (camelCase, PascalCase for components). ✅
- **TypeScript:** Frontend uses TypeScript; types in `types/`, api.ts; some `any` or loose types may remain.

---

## PART 12 — FINAL REPORT

### Ratings (1–5)

| Area | Rating | Comment |
|------|--------|--------|
| System architecture | 4 | Clear separation of frontend/backend, App Router, route groups; minor inconsistencies (e.g. AdminDashboardPage location, legacy App.tsx). |
| Frontend performance | 4 | Server/client split correct; caching on public APIs; some raw `<img>` and optional recharts code-splitting. |
| Backend API | 4 | RESTful, cached where appropriate, validated and protected; a few admin endpoints could add validation. |
| Security | 4 | Auth, roles, sanitization, upload controls in place; XSS mitigation for user-facing HTML could be stronger. |
| SEO | 4 | robots, sitemap, metadata, JSON-LD on key pages; sitemap could be dynamic. |
| Scalability | 4 | Indexes on main models, CDN-ready media, cron for scheduling; no major bottlenecks identified. |

### CRITICAL issues

- **None.** No critical bugs or security holes that require immediate change.

### MEDIUM issues

1. **Blog post HTML (XSS):** Rendering blog content with `dangerouslySetInnerHTML` without sanitization. Mitigation: sanitize on save and/or on render (e.g. DOMPurify).
2. **Order schema structure:** Confirm whether `briefId`, `assetIds`, `orderTimestamp` belong inside `order` or at root; fix schema and indentation if needed.
3. **next.config images:** Remove deprecated `images.domains` and rely on `remotePatterns` only.
4. **Orphan media files:** No job to remove files that no longer have a MediaAsset record; consider a periodic cleanup or sync script.
5. **Sitemap:** Currently static; consider dynamic sitemap for blog posts and service pages for better indexing.

### LOW priority improvements

1. Replace remaining raw `<img>` with `next/image` where possible and ensure alt text.
2. Dynamically import recharts only on the analytics page to reduce main bundle size.
3. Add express-validator (or similar) to admin endpoints that accept JSON (e.g. testimonials, about, team) for critical fields.
4. Remove or refactor `frontend/App.tsx` if it is no longer the active app entry.
5. Unify admin page component location (e.g. move AdminDashboardPage under `pages/admin/` for consistency).
6. Lint pass for unused imports and optional TypeScript strictness improvements.

---

## Recommended roadmap

1. **Short term (safe, high value)**  
   - Remove duplicate `'use client'` (done).  
   - Remove `images.domains` from next.config.mjs.  
   - Verify Order schema and fix if `briefId`/`assetIds`/`orderTimestamp` should be top-level.

2. **Next sprint**  
   - Add HTML sanitization for blog content (save or render).  
   - Dynamic sitemap for blog and services.  
   - Optional: dynamic import for recharts on analytics page.

3. **Backlog**  
   - Replace raw `<img>` with Next.js Image and audit alt text.  
   - Media orphan cleanup script or job.  
   - Stricter validation on selected admin endpoints.  
   - Confirm App.tsx usage and clean up if legacy.

---

*End of report. No large rewrites recommended; only targeted fixes and incremental improvements.*
