# Deploy Jinubify to Render via GitHub

This guide prepares the **Jinubify** stack (Next.js frontend + Express backend + MongoDB) for hosting on [Render](https://render.com) with GitHub.

---

## Architecture on Render

| Service       | Type   | Repo directory | Build              | Start     |
|---------------|--------|-----------------|--------------------|-----------|
| **jinubify-api**  | Web (Node) | `backend/`  | `npm install`       | `npm start` |
| **jinubify-web**  | Web (Node) | `frontend/` | `npm install && npm run build` | `npm start` |

- **Backend** runs Express on the port Render assigns (`PORT`).
- **Frontend** is a Next.js app; build uses `NEXT_PUBLIC_API_URL` to point to the backend.
- **Database**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier). Render does not host MongoDB.

---

## 1. Prerequisites

- [GitHub](https://github.com) account and this repo pushed to GitHub.
- [Render](https://render.com) account.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster and connection string.

---

## 2. MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a database user and note username/password.
3. **Network Access** (required for Render): Add `0.0.0.0/0` (**Allow Access from Anywhere**) so Render can connect. Skipping this causes “IP isn’t whitelisted” and startup failures—see **§8 Troubleshooting**.
4. Get the connection string (e.g. **Connect → Drivers → Node.js**). It looks like:
   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/jinubify?retryWrites=true&w=majority
   ```
5. Replace `USER` and `PASSWORD` with your DB user. Use this as `MONGODB_URI`.

---

## 3. Connect GitHub to Render

1. Log in to [Render](https://dashboard.render.com).
2. **New +** → **Blueprint**.
3. Connect your GitHub account and select the **Jinubify** repository.
4. Render will detect `render.yaml` in the repo root. Confirm the **root directory** is the repo root (not `backend` or `frontend`).
5. Click **Apply**.

---

## 4. Set environment variables

After the Blueprint is applied, set these in the Render Dashboard.

### Backend (jinubify-api)

| Key            | Value / action |
|----------------|-----------------|
| **MONGODB_URI** | Your Atlas connection string (from step 2). |
| **JWT_SECRET**  | Either leave **Generated** (Render can generate) or set your own (min 32 characters). |
| **FRONTEND_URL** | Usually auto-set from the frontend service URL. If not, set to `https://jinubify-web.onrender.com` (or your frontend URL). |
| **BASE_URL**      | Optional but recommended: the **public** website origin users scan from QR codes (no trailing slash), e.g. `https://www.yourdomain.com`. When set, onboarding QR codes embed this host so `/u/:slug` links match production. If omitted, `FRONTEND_URL` is used. |

Optional (contact form, etc.): `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`, `JWT_EXPIRES_IN`, `MEDIA_BASE_URL`.

### Frontend (jinubify-web)

| Key                     | Value / action |
|-------------------------|----------------|
| **NEXT_PUBLIC_API_URL** | Backend API base URL including `/api`, e.g. `https://jinubify-api.onrender.com/api`. (Replace `jinubify-api` with your backend service name if different.) |

Optional: `NEXT_PUBLIC_MEDIA_BASE_URL`, `NEXT_PUBLIC_SITE_URL` for CDN or custom domain.

**Important:** Update **NEXT_PUBLIC_API_URL** after the first deploy so it uses your real backend URL. Until then, the frontend may still build but will point at the wrong API.

---

## 5. Deploy

1. Save the env vars and trigger a deploy (or push a commit; Render will redeploy if auto-deploy is on).
2. Backend: build runs `npm install`, start runs `npm start` in `backend/`.
3. Frontend: build runs `npm install && npm run build` in `frontend/` (so `NEXT_PUBLIC_API_URL` must be set before or at deploy).
4. Wait for both services to show **Live**. Backend health check uses `/api/health`.

---

## 6. After first deploy

1. **Set frontend env:** In **jinubify-web** → **Environment**, set `NEXT_PUBLIC_API_URL` to `https://<your-backend-service-name>.onrender.com/api`, then **Save** and **Manual Deploy** so the frontend rebuilds with the correct API URL.
2. **CORS:** Backend uses `FRONTEND_URL` for CORS. If you use a custom domain for the frontend, set `FRONTEND_URL` to that (e.g. `https://jinubify.com`).
3. **Admin:** Create an admin user against the production DB (e.g. run `create-admin` locally with `MONGODB_URI` set to Atlas, or add a one-off script/endpoint if you prefer).

---

## 7. Custom domains (optional)

- **Render Dashboard** → your service → **Settings** → **Custom Domains**.
- Add your domain and follow Render’s DNS instructions.
- For frontend: set `NEXT_PUBLIC_SITE_URL` (and optionally `NEXT_PUBLIC_API_URL` if the API is on a custom domain).
- For backend: set `FRONTEND_URL` to the frontend’s public URL (custom or Render).

---

## 8. Troubleshooting: MongoDB connection on Render

This is **not fixed in application code**. Atlas blocks the connection until Network Access allows Render.

**Symptoms in logs:** `Could not connect to any servers in your MongoDB Atlas cluster`, `IP that isn't whitelisted`, or `Server selection timed out after … ms`.

**Fix:**

1. Open [Atlas](https://cloud.mongodb.com) → **Network Access** → **Add IP Address**.
2. Choose **Allow Access from Anywhere** (`0.0.0.0/0`), **or** add every outbound IP from [Render outbound IPs](https://render.com/docs/outbound-ip-addresses) if you refuse open access.
3. Save; wait a minute, then **restart** or redeploy the Render backend.

**Also check:** cluster is **not paused**; **Database Access** user/password matches `MONGODB_URI`; special characters in the password are **URL-encoded** in the connection string; Render **Environment** for the API service has the correct `MONGODB_URI` (no extra spaces or quotes).

---

## 9. Uploads / media

- Backend uses a local `uploads/` directory. On Render, the filesystem is **ephemeral**: uploads are lost on redeploy.
- For production, use a persistent store (e.g. S3, Cloudinary) and set `MEDIA_BASE_URL` (and frontend `NEXT_PUBLIC_MEDIA_BASE_URL` if applicable). The app already supports `MEDIA_BASE_URL` in backend config.

---

## 9. Free tier note

On the free tier, services spin down after a period of inactivity. The first request after spin-down can take 30–60 seconds. For always-on uptime, use a paid plan.

---

## 11. Useful links

- [Render Blueprint spec](https://render.com/docs/blueprint-spec)
- [Render monorepo support](https://render.com/docs/monorepo-support)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

---

## Quick checklist

- [ ] Repo pushed to GitHub.
- [ ] MongoDB Atlas cluster created; connection string and network access configured.
- [ ] Render Blueprint connected to repo; `render.yaml` at repo root.
- [ ] Backend env: `MONGODB_URI`, `JWT_SECRET`; `FRONTEND_URL` from frontend URL or set manually.
- [ ] Frontend env: `NEXT_PUBLIC_API_URL` = `https://<backend-service>.onrender.com/api`.
- [ ] Both services deployed and Live.
- [ ] Frontend redeployed after setting `NEXT_PUBLIC_API_URL` so build uses correct API URL.
