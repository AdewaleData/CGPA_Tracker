# Deploying CGPA Tracker Pro

You can run everything with **Docker** on a VPS or deploy the **frontend** and **backend** separately (common: **Vercel** + **Render** / **Railway** / **Fly.io**).

---

## 1) Environment checklist

| Service | Required |
|--------|----------|
| **PostgreSQL** | Database reachable from the API container or host |
| **API** | `DATABASE_URL` or `POSTGRES_*`, strong `JWT_SECRET` |
| **API** | `CORS_ORIGINS` = your **public** frontend URL(s), comma-separated (e.g. `https://cgpa.vercel.app`) |
| **Frontend build** | `BACKEND_URL` = **public base URL of the API** (no `/api` suffix), e.g. `https://cgpa-api.onrender.com` |

The browser calls **`/backend-api/*`** on the Next host; Next rewrites to **`{BACKEND_URL}/api/*`**. You do **not** need `NEXT_PUBLIC_API_URL` unless you bypass the proxy.

---

## 2) Windows / OneDrive and `next build`

If **`npm run build`** fails with **`EPERM: operation not permitted, symlink`** while writing **`.next/standalone`**, that is usually **Next standalone + Windows** (symlinks blocked or **OneDrive** blocking them). This repo’s **Dockerfile** builds on **Linux** and does **not** use standalone output, so **`docker compose … build`** and **Vercel** builds are unaffected. For a local production build on Windows, run the build **inside Docker**, or enable **Developer Mode** / move the project off OneDrive.

---

## 3) Docker (single host / VPS)

From the repository root:

```bash
export JWT_SECRET=$(openssl rand -hex 32)
docker compose -f docker-compose.deploy.yml up --build
```

- **App:** http://localhost:3000  
- **API:** http://localhost:8000  
- **Health:** http://localhost:8000/health  

**Production hardening:** change the Postgres password in `docker-compose.deploy.yml`, restrict `CORS_ORIGINS` to your real domain, put TLS in front (Caddy, Traefik, or a cloud load balancer), and use secrets instead of inline `JWT_SECRET` when possible.

---

## 4) Vercel (frontend) + managed API

### Frontend (Vercel)

1. Import this GitHub repo in [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. **Environment variables** (Production):
   - `BACKEND_URL` = `https://<your-api-host>` (scheme + host only; no trailing `/api`).
4. Deploy. Vercel runs `npm run build` — `BACKEND_URL` must be set **before** the build so rewrites target the correct API.

### Backend (Render, Railway, Fly, etc.)

1. Create a **PostgreSQL** instance and note the connection string.
2. Deploy the **backend** (monorepo):

#### Railway — “skipping `backend/Dockerfile`” / “Railpack could not determine how to build”

With **Root Directory empty**, Railway only treats **`Dockerfile`** at the **repo root** as the Docker entrypoint; paths like **`backend/Dockerfile`** are **skipped** (`acceptChildOfRepoRoot: false`). If your build log **does not list** `Dockerfile` or `railway.json` at the top level, you are on an **old commit** — pull **`main`** from GitHub and redeploy.

**Option A (recommended):** In the **API** service → **Settings** → **Root Directory**, set **`backend`**. Then the build context is only `backend/`, and **`backend/Dockerfile`** is valid (it sits at the root of that context). **`backend/railway.json`** forces **`builder: DOCKERFILE`**. If the dashboard asks for a **config file path**, use **`/backend/railway.json`** (leading slash, repo-relative path).

**Option B (repo root):** Leave **Root Directory** empty. Ensure the repo has **`Dockerfile`** + **`railway.json`** at the **repository root** (not only under `backend/`). If Railpack still runs, add a service variable **`RAILWAY_DOCKERFILE_PATH`** = **`Dockerfile`**, then redeploy. In the UI, pick **Dockerfile** as the builder if you see that option.

#### Render / Fly

Use **`Dockerfile`** at the **repo root** with build context **`.`**, or set the service root to **`backend`** and build from **`backend/Dockerfile`**.

3. Set:
   - `DATABASE_URL` (or split `POSTGRES_*`)
   - `JWT_SECRET` (long random string)
   - `CORS_ORIGINS` = `https://<your-vercel-app>.vercel.app` (and any preview URLs you use, comma-separated)

4. After the API has a public URL, set Vercel’s `BACKEND_URL` to that origin and **redeploy** the frontend so the rewrite target updates.

---

## 5) Smoke tests after deploy

1. `GET https://<api>/health` → `{"status":"ok"}`
2. Open the site, **register**, then **dashboard** — if CORS or `BACKEND_URL` is wrong, login or data loads will fail in the browser Network tab.

---

## 6) Migrations

The API runs SQLAlchemy `create_all` on startup for development convenience. For strict production control, apply **`database/schema.sql`** (and any files under `database/migrations/`) against Postgres before or after first deploy, and treat model changes as migrations going forward.
