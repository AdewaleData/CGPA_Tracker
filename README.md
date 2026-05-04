# CGPA Tracker Pro

<p align="center">
  <img src="frontend/public/cgpa-brand-mark.png" alt="CGPA Tracker Pro logo" width="120" height="120" />
</p>

<p align="center">
  <strong>Semester-aware GPA and CGPA tracking for multi-year degree programs.</strong>
</p>

---

## Overview

**CGPA Tracker Pro** is a full-stack academic tracker: students (or admins) manage **semesters**, **courses**, and **letter grades**, while the system maintains **term GPA**, **cumulative CGPA**, and simple **analytics**—with support for **4.0 and 5.0 grading scales** and **4-, 5-, or 6-year** program lengths.

| Layer | Technology |
|--------|------------|
| **API** | [FastAPI](https://fastapi.tiangolo.com/) (Python), JWT auth, SQLAlchemy |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Web app** | [Next.js](https://nextjs.org/) 14 (App Router), React 18, Tailwind CSS |

---

## Features

- **Accounts** — Register and sign in with JWT; profile and grading scale in **Settings**.
- **Program setup** — Choose program length; semesters are generated in order with **active / completed / upcoming** states.
- **Courses** — Per-semester course rows (code, title, credits, grade); sync saves GPA/CGPA.
- **Dashboard** — Current CGPA, credits, quality points, active term, and **CGPA trend** chart.
- **Reports** — Trend and term-GPA views (PDF export planned).
- **Theming** — Light and dark UI; landing and app respect your preference.
- **Dev-friendly API** — Same-origin `/backend-api` proxy in Next dev to avoid CORS friction.

---

## Repository layout

```
CGPA/
├── backend/                 # FastAPI (Dockerfile for production)
├── frontend/              # Next.js 14 (Dockerfile: next start + full .next)
├── database/              # SQL schema, migrations, setup guides
├── scripts/               # Helper scripts (e.g. dev.ps1)
├── docker-compose.yml     # Optional local PostgreSQL (dev)
├── docker-compose.deploy.yml  # Postgres + API + web (production-style)
├── DEPLOY.md              # Full deployment guide (Docker, Vercel, env vars)
└── README.md
```

---

## Prerequisites

- **Python** 3.11+ (3.12+ recommended) and `pip`
- **Node.js** 20+ and **npm** (or **pnpm** — `packageManager` is set in `frontend/package.json`)
- **PostgreSQL** 14+ (local install, or Docker via `docker-compose.yml`)

---

## Quick start

### 1. Database

**Option A — Docker**

```bash
docker compose up -d
```

Use `postgresql://postgres:postgres@localhost:5432/cgpa_tracker` in `backend/.env` (see `backend/.env.example` for split variables).

**Option B — existing Postgres**

Create a database and user, then set `POSTGRES_*` or `DATABASE_URL` in `backend/.env`.  
See **`database/SETUP.md`** and **`database/SETUP_LOCAL_POSTGRES_WINDOWS.md`** for detailed steps and migrations.

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # or cp; edit .env with your DB and JWT_SECRET
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Health:** `http://127.0.0.1:8000/health`  
- **OpenAPI docs:** `http://127.0.0.1:8000/docs`

### 3. Frontend

```bash
cd frontend
copy .env.example .env.local   # optional; defaults proxy to 127.0.0.1:8000
npm install                      # or: pnpm install
npm run dev
```

Open **http://localhost:3000**. In development, Next.js rewrites **`/backend-api/*`** to the FastAPI **`/api/*`** routes (see `frontend/next.config.mjs` and `BACKEND_URL`).

### 4. Run both (Windows)

From the repo root:

```powershell
.\scripts\dev.ps1
```

This opens two terminals: API on **8000** and Next on **3000**.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `POSTGRES_*` or `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET` | Signing key for access tokens (use a long random value) |
| `JWT_ALGORITHM` | Default `HS256` |
| `JWT_EXPIRE_MINUTES` | Token lifetime |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `BACKEND_URL` | Origin for Next rewrites (default `http://127.0.0.1:8000`) |
| `NEXT_PUBLIC_API_URL` | Optional override if the browser should call a remote API directly |

Secrets such as **`backend/.env`** and **`frontend/.env.local`** are listed in **`.gitignore`** and must not be committed.

---

## Scripts

| Command | Directory | Description |
|---------|-----------|-------------|
| `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` | `backend` | API with auto-reload |
| `npm run dev` | `frontend` | Next.js dev server (raised Node heap in `package.json` for stability) |
| `npm run build` / `npm start` | `frontend` | Production build and server |
| `npm run lint` | `frontend` | ESLint |

---

## API surface (summary)

Routes are mounted under **`/api`** (proxied as **`/backend-api`** from the Next app in dev).

- **`POST /api/auth/register`** — Create user, semesters, return token  
- **`POST /api/auth/login`** — Return token  
- **`GET/PATCH /api/auth/me`** — Profile and CGPA scale  
- **`GET /api/semesters`**, **`GET /api/semester/{id}`** — Semester list and detail  
- **`POST /api/courses/sync`** — Upsert courses for a semester  
- **`POST /api/semester/{id}/complete`** — Complete term  
- **`GET /api/dashboard`** — Aggregated stats for the home dashboard  

---

## Deployment

**Quick path (Docker on a server):**

```bash
export JWT_SECRET=$(openssl rand -hex 32)   # Windows: set JWT_SECRET=... 
docker compose -f docker-compose.deploy.yml up --build
```

Then open **http://localhost:3000** (or your server’s public IP + port behind HTTPS).

**Split hosting (e.g. Vercel + Render):** set **`BACKEND_URL`** on the frontend build to your API’s public origin, and set **`CORS_ORIGINS`** on the API to your frontend URL(s). Step-by-step instructions are in **[`DEPLOY.md`](./DEPLOY.md)**.

---

## Branding

- In-app logo: React component **`frontend/src/components/BrandLogo.tsx`**
- Favicon: **`frontend/public/icon.svg`** (linked from root layout metadata)
- Raster mark (README, marketing): **`frontend/public/cgpa-brand-mark.png`**

---

## Contributing

Issues and pull requests are welcome. Please keep secrets out of git, run **`npm run lint`** on the frontend, and match existing code style.

---

## License

Specify your license here (e.g. MIT) when you publish the project publicly.
