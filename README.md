# Jinubify

Full-stack platform: **Next.js 16** (frontend) + **Express** (API) + **MongoDB**.

- **Frontend:** `frontend/` – Next.js App Router, Tailwind, React Query.
- **Backend:** `backend/` – Express, Mongoose, JWT auth, CMS, uploads.

## Local development

1. **Backend:** `cd backend && npm install && cp env.example .env` — set `MONGODB_URI` and `JWT_SECRET`, then `npm run dev`.
2. **Frontend:** `cd frontend && npm install && npm run dev` — ensure `NEXT_PUBLIC_API_URL` points to the backend (default `http://localhost:5000/api`).

See `backend/README.md` and `frontend/README.md` for details.

## Deploy to Render (GitHub)

This repo is set up for [Render](https://render.com) via GitHub.

- **Quick checklist:** **[DEPLOY_STEPS.md](./DEPLOY_STEPS.md)** — numbered steps to finalize deployment.
- **Full guide:** **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)** — Atlas, env vars, custom domains, troubleshooting.
