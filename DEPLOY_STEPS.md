# Steps to Finalize Render Deployment

Follow these in order. Full details are in [RENDER_DEPLOY.md](./RENDER_DEPLOY.md).

---

## Before you deploy

1. **MongoDB Atlas**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free cluster.
   - **Database Access** → Add user, note username & password.
   - **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere).
   - **Connect** → Drivers → copy connection string. Replace `<password>` with your DB user password.
   - Save it; you’ll use it as `MONGODB_URI`.

2. **GitHub**
   - Push this repo to GitHub (all changes committed and pushed).

---

## Deploy on Render

3. **Create Blueprint**
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - **New +** → **Blueprint**.
   - Connect GitHub and select the **jinubify** repo.
   - Render will read `render.yaml`. Click **Apply**.

4. **Backend env (jinubify-api)**
   - Open the **jinubify-api** service.
   - **Environment** tab:
     - **MONGODB_URI** → paste your Atlas connection string.
     - **JWT_SECRET** → leave as “Generate” or set your own (min 32 characters).
   - **Save Changes**. Trigger **Manual Deploy** if the first deploy already ran.

5. **Wait for backend**
   - Wait until **jinubify-api** is **Live**.
   - Note the backend URL, e.g. `https://jinubify-api.onrender.com`.

6. **Frontend env (jinubify-web)**
   - Open the **jinubify-web** service.
   - **Environment** tab:
     - **NEXT_PUBLIC_API_URL** → backend URL + `/api`, e.g. `https://jinubify-api.onrender.com/api`.
   - **Save Changes** → **Manual Deploy** (so the frontend rebuilds with the correct API URL).

7. **Wait for frontend**
   - Wait until **jinubify-web** is **Live**.
   - Open the frontend URL (e.g. `https://jinubify-web.onrender.com`) and test login/navigation.

---

## After deploy

8. **Create admin user (optional)**
   - On your machine: `cd backend`.
   - Create `.env` with only:  
     `MONGODB_URI=<your-atlas-connection-string>`
   - Run:  
     `npm run create-admin -- admin@yourdomain.com YourSecurePassword Admin`
   - Use that email/password to sign in at `https://jinubify-web.onrender.com/admin`.

9. **CORS (if needed)**
   - If you add a custom domain for the frontend, set **FRONTEND_URL** on **jinubify-api** to that URL (e.g. `https://jinubify.com`).

10. **Custom domains (optional)**
    - In each service → **Settings** → **Custom Domains** → add your domain and follow Render’s DNS instructions.

---

## If something fails

- **502 Bad Gateway / "No open HTTP ports" / logs show `next dev`:** Set the frontend **Start Command** to `npm start` (not `npm run dev`) in Render → your frontend service → **Settings** → **Build & Deploy**. Save and redeploy.
- **Backend won’t start / MongoDB “IP isn’t whitelisted” or “Server selection timed out”:** In Atlas → **Network Access**, add **`0.0.0.0/0`** (or Render’s outbound IPs). This is not fixable in repo code. See [RENDER_DEPLOY.md §8](./RENDER_DEPLOY.md#8-troubleshooting-mongodb-connection-on-render).
- **Backend won’t start (other):** Check **Logs**; usually missing or wrong `MONGODB_URI` or `JWT_SECRET`.
- **Frontend build fails:** Ensure `NEXT_PUBLIC_API_URL` is set and has no trailing slash (e.g. `https://jinubify-api.onrender.com/api`).
- **Frontend loads but API calls fail:** Check **NEXT_PUBLIC_API_URL** and **FRONTEND_URL** (CORS). Redeploy frontend after changing `NEXT_PUBLIC_*`.

For more detail, see [RENDER_DEPLOY.md](./RENDER_DEPLOY.md).
