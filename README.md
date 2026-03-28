# UNiverse Capital — Flask + MySQL Backend

Production-grade REST API for the UNiverse Capital website.
**Python 3.12 · Flask 3.1 · MySQL 8 · Gunicorn · Docker**

---

## File Map

```
backend/
├── app.py             # Application factory + all route handlers
├── config.py          # Dev / Test / Production config classes
├── db.py              # MySQL connection pool (get_db / init_db / close_db)
├── validators.py      # Pure-Python input validation (no deps)
├── rate_limit.py      # MySQL-backed rate limiting (no Redis)
├── mailer.py          # SMTP notifications via stdlib smtplib
├── schema.sql         # Idempotent DB schema (run automatically on startup)
├── wsgi.py            # Gunicorn entry point
├── gunicorn.conf.py   # Production Gunicorn settings
├── Dockerfile         # Multi-stage Python image
├── requirements.txt   # Pinned dependencies
├── .env.example       # Secret template
├── tests/
│   └── test_api.py    # Full pytest integration test suite
└── README.md
```

---

## API Reference

| Method   | Path                              | Auth   | Description                        |
|----------|-----------------------------------|--------|------------------------------------|
| `GET`    | `/api/health`                     | None   | Health + DB connectivity check     |
| `POST`   | `/api/contact`                    | None   | Submit contact/enquiry form        |
| `GET`    | `/api/enquiries`                  | Token  | Paginated list with search/filter  |
| `GET`    | `/api/enquiries/<id>`             | Token  | Single enquiry detail              |
| `PATCH`  | `/api/enquiries/<id>/status`      | Token  | Update status and/or admin notes   |
| `DELETE` | `/api/enquiries/<id>`             | Token  | Soft-archive an enquiry            |
| `POST`   | `/api/admin/purge-rate-limit`     | Token  | Purge stale rate-limit table rows  |

### POST `/api/contact`

```json
{
  "full_name":          "Arjun Sharma",
  "email":              "arjun@example.com",
  "phone":              "+91 98765 43210",
  "investor_type":      "Quant / Developer",
  "investment_horizon": "2 – 5 Years",
  "message":            "Interested in research collaboration."
}
```

Rate limited to **5 requests / IP / hour** (MySQL-backed, no Redis).

On success: fires two async emails — admin notification + enquirer auto-reply.

### PATCH `/api/enquiries/<id>/status`

```json
{ "status": "replied", "notes": "Responded via email on 2024-01-15." }
```

Valid statuses: `new` · `read` · `replied` · `archived`

### Admin auth

Pass your token via header **or** query string:
```
Authorization: Bearer <ADMIN_TOKEN>
GET /api/enquiries?token=<ADMIN_TOKEN>
```

### Query parameters for `GET /api/enquiries`

| Param      | Type   | Default | Description                              |
|------------|--------|---------|------------------------------------------|
| `page`     | int    | 1       | Page number                              |
| `per_page` | int    | 20      | Results per page (max 100)               |
| `status`   | string | —       | Filter by status: `new/read/replied`     |
| `q`        | string | —       | Search full_name, email, phone           |

---

## Local Setup

### 1. Provision MySQL

```sql
-- Run as MySQL root
CREATE DATABASE universe_capital
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'universe_user'@'localhost' IDENTIFIED BY 'your_strong_password';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
  ON universe_capital.* TO 'universe_user'@'localhost';

FLUSH PRIVILEGES;
```

The app runs `schema.sql` automatically at startup — no manual import needed.

### 2. Python environment

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment

```bash
cp .env.example .env
# Edit: set MYSQL_PASSWORD, SECRET_KEY, ADMIN_TOKEN
# Optionally set SMTP_* variables for email notifications
```

### 4. Start the API

```bash
FLASK_ENV=development python app.py
# API → http://localhost:5000
```

Vite's dev proxy (`vite.config.js`) forwards `/api/*` from port 5173 → 5000.

### 5. Run tests

```bash
FLASK_ENV=testing pytest backend/tests/ -v
```

---

## Docker / Full Stack

```bash
# Copy and configure secrets
cp backend/.env.example backend/.env
# Edit backend/.env

# Build and start everything
docker compose up --build

# Site  → http://localhost:8080
# API   → http://localhost:5000/api
# MySQL → localhost:3306
```

To stop and remove volumes:
```bash
docker compose down -v
```

---

## Database Schema

| Table               | Description                                    |
|---------------------|------------------------------------------------|
| `enquiries`         | Contact form submissions with full audit trail |
| `rate_limit_log`    | Per-IP/endpoint/hour counters (no Redis)       |
| `admin_users`       | Future admin panel accounts (scaffold)         |
| `schema_migrations` | Applied migration version tracking             |

---

## Email Notifications

Set `SMTP_HOST` in `.env` to enable. When a form is submitted:

1. **Admin notification** → `NOTIFY_TO` inbox with full enquiry details and Reply-To set to the enquirer's address (one-click reply).
2. **Auto-reply confirmation** → Sent to the enquirer with their reference ID.

Both emails are sent in a daemon thread so form submission response time is unaffected.

To disable, leave `SMTP_HOST` empty.

---

## Environment Variables

| Variable            | Default                          | Notes                              |
|---------------------|----------------------------------|------------------------------------|
| `FLASK_ENV`         | `development`                    | `development` / `testing` / `production` |
| `SECRET_KEY`        | *(insecure default)*             | **Change in production**           |
| `MYSQL_HOST`        | `127.0.0.1`                      | `db` inside Docker Compose         |
| `MYSQL_PORT`        | `3306`                           |                                    |
| `MYSQL_USER`        | `universe_user`                  |                                    |
| `MYSQL_PASSWORD`    | *(empty)*                        | **Required**                       |
| `MYSQL_DB`          | `universe_capital`               |                                    |
| `MYSQL_POOL_SIZE`   | `5`                              | Per-worker pool; 10 in production  |
| `CORS_ORIGINS`      | `http://localhost:5173,...`      | Comma-separated                    |
| `ADMIN_TOKEN`       | *(insecure default)*             | **Change in production**           |
| `SMTP_HOST`         | *(empty = disabled)*             |                                    |
| `SMTP_PORT`         | `587`                            |                                    |
| `SMTP_USER`         | *(empty)*                        |                                    |
| `SMTP_PASS`         | *(empty)*                        |                                    |
| `SMTP_FROM`         | `noreply@universecapital.in`     |                                    |
| `SMTP_USE_TLS`      | `true`                           |                                    |
| `NOTIFY_TO`         | `contact@universecapital.in`     | Admin notification recipient       |
| `PORT`              | `5000`                           |                                    |
| `WEB_CONCURRENCY`   | `2×CPU+1`                        | Gunicorn worker count override     |


