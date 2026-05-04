# Step-by-step: Local PostgreSQL on Windows (for CGPA Tracker)

This guide sets up **PostgreSQL on your PC** and the **`cgpa_tracker`** database the backend expects. Commands and menus refer to **Windows 10/11**.

---

## Part A — Install PostgreSQL (skip if you already have it)

### A1. Download the installer

1. Open a browser and go to the official PostgreSQL Windows downloads:  
   [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Use the **EDB installer** link (common choice for Windows).
3. Download the installer for your architecture (usually **64-bit**).

### A2. Run the installer

1. Run the downloaded `.exe` **as Administrator** (right-click → *Run as administrator*) if you hit permission errors.
2. **Installation directory:** keep the default unless you have a reason to change it (example: `C:\Program Files\PostgreSQL\18\`).
3. **Select components:** at minimum include:
   - **PostgreSQL Server**
   - **pgAdmin 4** (GUI — very helpful)
   - **Command Line Tools** (includes `psql`)
4. **Data directory:** default is fine (example: `C:\Program Files\PostgreSQL\18\data`).

### A3. Set the superuser password (important)

1. The installer asks for a password for the **`postgres`** database superuser.
2. **Choose a strong password** and **save it somewhere safe** (password manager or note). You will need it for `DATABASE_URL` and for pgAdmin.
3. This password is **not** recoverable through this app — if you lose it, you must reset Postgres credentials using PostgreSQL docs/support.

### A4. Port

1. Default port is **`5432`**. Keep it unless something else already uses 5432.
2. If you change the port, remember it for `DATABASE_URL` (`...localhost:PORT/...`).

### A5. Finish and verify the service

1. Complete the wizard. The installer usually starts PostgreSQL as a **Windows service**.
2. Open **Services** (`Win + R` → type `services.msc` → Enter).
3. Find a service like **`postgresql-x64-18`** (version number may differ).
4. Status should be **Running**. If not, right-click → **Start**.

You now have PostgreSQL installed.

---

## Part B — Create the `cgpa_tracker` database

Use **either** pgAdmin **or** SQL Shell — not both required.

### Option 1 — Using pgAdmin (recommended if you are new to SQL)

#### B1. Open pgAdmin

1. Press **Start** and search for **pgAdmin 4** → open it.
2. The first launch may ask for a **master password** for pgAdmin itself (this is separate from the `postgres` user password). Set one you will remember.

#### B2. Connect to the server

1. In the left tree, expand **Servers**.
2. You should see **PostgreSQL** (or similar). Click it.
3. If prompted, enter the **`postgres` user password** from Part A3.

#### B3. Create the database

1. Right-click **Databases** → **Create** → **Database…**
2. **Database** name: `cgpa_tracker` (exact spelling, lowercase).
3. Click **Save**.

#### B4. Confirm

1. Under **Databases**, you should see **`cgpa_tracker`** listed.

### Option 2 — Using SQL Shell (psql)

#### B1. Open SQL Shell

1. Press **Start** and search for **SQL Shell (psql)** → open it.
2. It may prompt in order:
   - **Server:** press Enter for default (`localhost`).
   - **Database:** press Enter for default (`postgres`).
   - **Port:** press Enter for default (`5432`).
   - **Username:** press Enter for default (`postgres`) or type `postgres`.
   - **Password:** type the **`postgres` user password** from Part A3 (characters may not echo — that is normal).

#### B2. Create the database

At the `postgres=#` prompt, run:

```sql
CREATE DATABASE cgpa_tracker;
```

#### B3. Confirm

```sql
\l
```

You should see `cgpa_tracker` in the list.

To quit psql:

```text
\q
```

---

## Part C — Point the CGPA backend at your database

### C1. Open or create `backend/.env`

1. In your project folder, go to **`backend`**.
2. If **`backend/.env`** does not exist, copy **`backend/.env.example`** and rename the copy to **`.env`**.

### C2. Set database credentials in `backend/.env`

**Recommended (password can include `@` — no URL encoding):**

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD_HERE
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=cgpa_tracker
```

The app builds the connection string with proper encoding.

**Optional — single URL instead:** set `DATABASE_URL=postgresql://...` (then you must URL-encode `@` in the password as `%40`, etc.).

#### If the API says “password authentication failed” but pgAdmin works

The password stored for user **`postgres`** on the server may not match what you think. In pgAdmin **Query Tool** (connected as `postgres`), run once:

```sql
ALTER USER postgres WITH PASSWORD 'YourChosenPassword';
```

Use the **same** string in **`POSTGRES_PASSWORD`** in **`backend/.env`** (no quotes around the value). Restart the API.

### C3. Set `JWT_SECRET`

In the same **`.env`**, set **`JWT_SECRET`** to a long random string (not the example placeholder). This secures your login tokens.

---

## Part D — Verify everything works

### D1. Install Python dependencies (once)

In **PowerShell** or **Command Prompt**:

```powershell
cd path\to\CGPA\backend
python -m pip install -r requirements.txt
```

### D2. Start the API

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Success looks like:** server stays running and you do **not** see `password authentication failed` or `database "cgpa_tracker" does not exist`.

### D3. Quick HTTP check

Open a browser:

- [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

You should see JSON like: `{"status":"ok"}`.

The first successful startup also **creates the app’s tables** in `cgpa_tracker` automatically.

---

## Troubleshooting (common on Windows)

| Problem | What to try |
|--------|-------------|
| `password authentication failed for user "postgres"` | Wrong password in `DATABASE_URL`. Reset or recover the `postgres` password using PostgreSQL documentation, or reinstall if this is a fresh dev machine and you can afford to. |
| `database "cgpa_tracker" does not exist` | Repeat **Part B** and ensure the name is exactly `cgpa_tracker`. |
| `could not connect to server` on `localhost` | Confirm the **PostgreSQL** Windows service is **Running** (Part A5). Check firewall if you use a remote host. |
| Port **5432** already in use | Another app (or second Postgres) is using 5432. Stop the other service or change Postgres port in installer/service config and update `DATABASE_URL`. |
| IPv6 vs IPv4 issues (`::1`) | Try `127.0.0.1` instead of `localhost` in `DATABASE_URL`: `postgresql://postgres:...@127.0.0.1:5432/cgpa_tracker` |

---

## What you should have at the end

1. PostgreSQL **Windows service** = **Running**.
2. Database **`cgpa_tracker`** exists.
3. **`backend/.env`** has a correct **`DATABASE_URL`** and a strong **`JWT_SECRET`**.
4. **`uvicorn`** runs and **`/health`** returns OK.

Next: run the frontend from **`frontend`** (`pnpm dev` or `npm run dev`) and ensure **`NEXT_PUBLIC_API_URL`** in **`.env.local`** points to your API (default `http://127.0.0.1:8000/api`). See also [SETUP.md](./SETUP.md).
