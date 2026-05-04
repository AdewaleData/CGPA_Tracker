# Database setup (PostgreSQL)

This app expects a **PostgreSQL** database named **`cgpa_tracker`**. The FastAPI backend reads the connection string from **`backend/.env`** as `DATABASE_URL`.

**Windows — local PostgreSQL, full walkthrough (install → create DB → `.env` → test):**  
[SETUP_LOCAL_POSTGRES_WINDOWS.md](./SETUP_LOCAL_POSTGRES_WINDOWS.md)

If your database was created before **`users.cgpa_scale`** existed, run once:  
[migrations/001_add_users_cgpa_scale.sql](./migrations/001_add_users_cgpa_scale.sql)

On first successful API startup, **SQLAlchemy creates all tables** automatically. The file `database/schema.sql` is a **reference** (useful for DBA review, manual installs, or tooling); you do not have to run it if the API is allowed to create tables.

---

## Step 1 — Choose how you run PostgreSQL

Pick **one** of these:

| Option | Best for |
|--------|-----------|
| **A. PostgreSQL already on Windows** (installer / service) | You already have `postgresql-x64-*` running locally |
| **B. Docker** | You have Docker Desktop and want an isolated DB |
| **C. Hosted Postgres** (Neon, Supabase, Railway, etc.) | You want a cloud URL and no local server |

---

## Step 2 — Create the database

### A. Local Windows (pgAdmin or psql)

1. Open **pgAdmin** or **SQL Shell (psql)**.
2. Connect as the **`postgres`** superuser (use the password you set during PostgreSQL installation).
3. Run:

```sql
CREATE DATABASE cgpa_tracker;
```

4. Confirm it exists (optional):

```sql
\l
```

In pgAdmin: right-click **Databases → Create → Database**, name: `cgpa_tracker`.

### B. Docker (from repo root)

If you use the provided `docker-compose.yml`:

```bash
docker compose up -d
```

That creates a database **`cgpa_tracker`** with user **`postgres`** / password **`postgres`** on port **5432**.

**Important:** If you already have PostgreSQL on Windows using port **5432**, either stop the Windows service temporarily or change the **host port** in `docker-compose.yml` (e.g. `"5433:5432"`) and use port **5433** in `DATABASE_URL`.

### C. Cloud (Neon / Supabase / etc.)

1. Create a new project and a **Postgres** database.
2. Copy the **connection string** they provide (usually looks like `postgresql://user:pass@host/dbname?sslmode=require`).
3. Use that entire string as `DATABASE_URL` in `backend/.env` (see Step 3).

---

## Step 3 — Configure `DATABASE_URL` in the backend

1. In the **`backend`** folder, copy the example env file if you do not have `.env` yet:

   ```text
   copy .env.example .env
   ```

2. Open **`backend/.env`** and set **`DATABASE_URL`**.

### Local example (default superuser)

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cgpa_tracker
```

Replace `YOUR_PASSWORD` with the real password for the `postgres` user.

### Special characters in the password

If the password contains `@`, `#`, `/`, spaces, etc., you must **URL-encode** it inside the connection string, or Postgres will parse the URL incorrectly.

Examples:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `/` | `%2F` |
| `:` | `%3A` |

### SSL (cloud)

Hosted databases often require SSL. Your provider’s dashboard usually gives a full URL including `?sslmode=require` — paste that as-is into `DATABASE_URL`.

---

## Step 4 — Verify the connection

### Quick check: start the API

From the **`backend`** folder (after `pip install -r requirements.txt`):

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Success:** no `password authentication failed` or `could not connect` errors; tables are created on startup.
- Open `http://127.0.0.1:8000/health` — you should see `{"status":"ok"}`.

### Common errors

| Message | What to do |
|---------|------------|
| `password authentication failed for user "postgres"` | Fix user/password in `DATABASE_URL` to match your Postgres install. |
| `database "cgpa_tracker" does not exist` | Run `CREATE DATABASE cgpa_tracker;` (Step 2). |
| `could not connect to server` | Postgres service stopped, wrong host/port, or firewall blocking. |

---

## Step 5 — (Optional) Apply `schema.sql` manually

Normally **you can skip this** because the API creates tables.

Use `database/schema.sql` when:

- You want the schema applied by a DBA or CI without running the app, or
- You are comparing SQLAlchemy models to raw SQL.

Apply with psql (example):

```bash
psql -U postgres -d cgpa_tracker -f database/schema.sql
```

Paths and credentials depend on your environment.

---

## Step 6 — Point the frontend at the API

The database is only used by the **backend**. The Next.js app needs the API base URL (not the DB URL):

In **`frontend/.env.local`** (copy from `frontend/.env.example` if needed):

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Run the UI from **`frontend`**: `pnpm dev` or `npm run dev`.

---

## Summary checklist

1. [ ] PostgreSQL running (local, Docker, or cloud).
2. [ ] Database **`cgpa_tracker`** created (or name in URL matches provider).
3. [ ] **`backend/.env`** contains correct **`DATABASE_URL`** (and a strong **`JWT_SECRET`**).
4. [ ] **`uvicorn`** starts without DB errors; **`/health`** returns OK.
5. [ ] **`frontend/.env.local`** has **`NEXT_PUBLIC_API_URL`** pointing at your API.
