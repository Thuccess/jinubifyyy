# Frontend–Backend API Connection Report (Production)

**Date:** Verification scan  
**Production backend:** `https://jinubifyyy-2.onrender.com`  
**Production frontend:** `https://jinubifyyy-4.onrender.com`

---

## 1. API request locations

All HTTP calls use one of these two patterns:

| Location | How it calls the API | Base URL source |
|---------|----------------------|-----------------|
| **frontend/services/api.ts** | Single axios instance with `baseURL: API_BASE_URL` | `env.apiUrl` ← `NEXT_PUBLIC_API_URL` |
| **frontend/app/sitemap.ts** | `fetch(\`${API_BASE}/blogs|services...\`)` | `process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:5000/api'` |

No other files perform `fetch`, `axios`, or direct HTTP calls to the backend. All components, admin dashboard, and public pages use the **services/api.ts** layer (e.g. `authAPI`, `aboutAPI`, `testimonialsAPI`, `servicesAPI`, etc.), which uses the shared axios instance and therefore `NEXT_PUBLIC_API_URL`.

---

## 2. Localhost / hardcoded URL check

| File | Finding |
|------|---------|
| **frontend/config/env.ts** | `getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:5000/api')` — localhost is only the **default** when the env var is not set (e.g. local dev). In production, Render sets `NEXT_PUBLIC_API_URL`, so this value is not used. ✅ |
| **frontend/app/sitemap.ts** | `process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:5000/api'` — same: fallback for local dev only. ✅ |
| **frontend/next.config.mjs** | `hostname: 'localhost'` appears only in **image** `remotePatterns` (for dev image optimizer). Not used for API requests. ✅ |

**Result:** No API request uses a hardcoded production or localhost URL. The only “localhost” usage is as a **default when `NEXT_PUBLIC_API_URL` is unset** (correct for local development).

---

## 3. Environment variable usage

| Area | Usage | Status |
|------|--------|--------|
| **services/api.ts** | `const API_BASE_URL = env.apiUrl` → axios `baseURL` | ✅ Uses `NEXT_PUBLIC_API_URL` via `config/env` |
| **config/env.ts** | `apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:5000/api')` | ✅ Single source of truth |
| **app/sitemap.ts** | `const API_BASE = process.env.NEXT_PUBLIC_API_URL \|\| '...'` | ✅ Env with fallback |
| **components/AuthModal.tsx** | `process.env.NEXT_PUBLIC_API_URL` for OAuth base URL | ✅ Correct |
| **utils/image.ts** | `env.apiUrl` (backend origin for relative image paths) | ✅ Via config |
| **contexts/AuthContext.tsx** | Uses `authAPI` from `services/api` | ✅ Indirect use of env |

**Result:** All API and image base URLs go through `NEXT_PUBLIC_API_URL` (directly or via `env.apiUrl`).

---

## 4. Image URLs from the backend

- **utils/image.ts**  
  - Relative paths (e.g. `/uploads/xyz.jpg`) are prefixed with the backend origin derived from `env.apiUrl` (i.e. `NEXT_PUBLIC_API_URL` with `/api` stripped).  
  - So in production, images correctly resolve to `https://jinubifyyy-2.onrender.com/uploads/...`.

- **next.config.mjs**  
  - **Change made:** Added production backend host so Next.js Image optimizer can load API uploads in production:
    - `protocol: 'https'`, `hostname: 'jinubifyyy-2.onrender.com'`, `pathname: '/uploads/**'`
  - Without this, `<Image src={resolveImageUrl(...)} />` could be blocked or fail to load on Render.

---

## 5. Production deployment (Render)

With:

- **Frontend env:** `NEXT_PUBLIC_API_URL=https://jinubifyyy-2.onrender.com/api`
- **Backend env:** `FRONTEND_URL=https://jinubifyyy-4.onrender.com`

the following hold:

- All API calls from the frontend use `https://jinubifyyy-2.onrender.com/api`.
- CORS allows requests from `https://jinubifyyy-4.onrender.com`.
- Image URLs from the API resolve to `https://jinubifyyy-2.onrender.com/uploads/...` and are allowed by the Next.js image config.

**Important:** `NEXT_PUBLIC_*` is baked in at **build** time. After changing `NEXT_PUBLIC_API_URL` on Render, the frontend service must be **redeployed** (new build) for the change to take effect.

---

## 6. Summary

| Check | Result |
|-------|--------|
| All API call locations use env / config | ✅ Only `services/api.ts` and `sitemap.ts`; both use `NEXT_PUBLIC_API_URL` |
| No incorrect localhost usage | ✅ Localhost only as dev default when env unset |
| No missing env usage | ✅ All API and image base URLs go through `NEXT_PUBLIC_API_URL` / `env.apiUrl` |
| Image URLs use correct base | ✅ `utils/image.ts` uses `env.apiUrl`; next.config allows production backend host |
| Production (Render) ready | ✅ Set `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` and redeploy frontend after any env change |

**Conclusion:** The frontend is correctly connected to the backend for production. The only change applied was adding the production backend host to **next.config.mjs** so Next.js Image can load uploads from `https://jinubifyyy-2.onrender.com/uploads/**`.
