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

## 2) Docker (single host / VPS)

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

## 3) Vercel (frontend) + managed API

### Frontend (Vercel)

1. Import this GitHub repo in [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. **Environment variables** (Production):
   - `BACKEND_URL` = `https://<your-api-host>` (scheme + host only; no trailing `/api`).
4. Deploy. Vercel runs `npm run build` — `BACKEND_URL` must be set **before** the build so rewrites target the correct API.

### Backend (Render, Railway, Fly, etc.)

1. Create a **PostgreSQL** instance and note the connection string.
2. Deploy the **backend** from the `backend` folder (Dockerfile provided, or `pip install` + `uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
3. Set:
   - `DATABASE_URL` (or split `POSTGRES_*`)
   - `JWT_SECRET` (long random string)
   - `CORS_ORIGINS` = `https://<your-vercel-app>.vercel.app` (and any preview URLs you use, comma-separated)

4. After the API has a public URL, set Vercel’s `BACKEND_URL` to that origin and **redeploy** the frontend so the rewrite target updates.

---

## 4) Smoke tests after deploy

1. `GET https://<api>/health` → `{"status":"ok"}`
2. Open the site, **register**, then **dashboard** — if CORS or `BACKEND_URL` is wrong, login or data loads will fail in the browser Network tab.

---

## 5) Migrations

The API runs SQLAlchemy `create_all` on startup for development convenience. For strict production control, apply **`database/schema.sql`** (and any files under `database/migrations/`) against Postgres before or after first deploy, and treat model changes as migrations going forward.
