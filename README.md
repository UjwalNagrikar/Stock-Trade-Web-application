# UNiverse Capital — Web Application

> A production-grade quantitative investment firm website with a React frontend, Flask REST API, MySQL database, and Docker Compose orchestration.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Email Notifications](#email-notifications)
- [Production Notes](#production-notes)

---

## Overview

UNiverse Capital is a full-stack web application for an early-stage quantitative investment firm based in Nagpur, India. The site presents the firm's investment philosophy, market focus, and operational principles, and includes a contact/enquiry form with backend persistence, rate limiting, and automated email notifications.

**Key capabilities:**

- Institutional-grade React SPA with scroll-reveal animations and responsive design
- Production Flask API with connection pooling, input validation, and structured logging
- MySQL-backed contact form with admin CRUD endpoints
- Application-level rate limiting (no Redis required)
- SMTP email notifications — admin alert + enquirer auto-reply
- Full Docker Compose stack with Nginx reverse proxy and multi-stage builds
- Auto-bootstrapped database schema on first startup

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
└───────────────────┬─────────────────────────────┘
                    │ HTTP :8080
┌───────────────────▼─────────────────────────────┐
│           Nginx (frontend container)            │
│   • Serves React SPA (Vite build / /dist)       │
│   • Proxies /api/* → Flask API :5000            │
│   • Gzip, security headers, long-cache assets   │
└───────────┬─────────────────────┬───────────────┘
            │ static              │ /api/*
            │                    ▼
┌───────────▼─────────────────────────────────────┐
│         Flask API  (Gunicorn, :5000)            │
│   • Application factory pattern                 │
│   • MySQL connection pool (mysql-connector)     │
│   • Rate limiting backed by MySQL               │
│   • SMTP email via stdlib smtplib               │
└───────────────────┬─────────────────────────────┘
                    │ TCP :3306
┌───────────────────▼─────────────────────────────┐
│              MySQL 8.0                          │
│   • Auto-provisioned schema on startup          │
│   • Persistent volume (db_data)                 │
└─────────────────────────────────────────────────┘
```

**Docker network isolation:** The database (`db`) and API (`api`) share an `internal` bridge network not exposed to the host. The `frontend` and `api` containers share an `external` bridge network for proxying.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 19.x |
| **Frontend Build** | Vite | 8.x |
| **Frontend Serve** | Nginx | Alpine |
| **Backend** | Flask | 3.1 |
| **WSGI Server** | Gunicorn | 22.x |
| **Database** | MySQL | 8.0 |
| **DB Connector** | mysql-connector-python | 9.1 |
| **Runtime** | Python | 3.12 |
| **Node (build only)** | Node.js | 20 Alpine |
| **Containerisation** | Docker + Docker Compose | v3.9 |
| **Fonts** | Playfair Display, Source Serif 4, IBM Plex Sans/Mono | Google Fonts |

---

## Project Structure

```
universe-capital/
│
├── src/                        # React frontend source
│   ├── App.jsx                 # Single-file SPA — all components
│   ├── App.css                 # All styles and design tokens
│   ├── main.jsx                # React entry point
│   └── index.css               # Global reset (minimal)
│
├── public/
│   └── company.png             # Brand logo (place your logo here)
│
├── backend/
│   ├── app.py                  # Application factory + all route handlers
│   ├── config.py               # Dev / Test / Production config classes
│   ├── db.py                   # MySQL connection pool (get_db / init_db)
│   ├── validators.py           # Pure-Python input validation
│   ├── rate_limit.py           # MySQL-backed rate limiting
│   ├── mailer.py               # SMTP notifications via stdlib smtplib
│   ├── schema.sql              # Idempotent DB schema (auto-run on startup)
│   ├── wsgi.py                 # Gunicorn entry point
│   ├── gunicorn.conf.py        # Production Gunicorn settings
│   ├── Dockerfile              # Multi-stage Python image (builder + runtime)
│   ├── requirements.txt        # Pinned Python dependencies
│   └── .env                    # Runtime secrets (never commit this)
│
├── Dockerfile                  # Multi-stage Node → Nginx frontend image
├── nginx.conf                  # Nginx SPA + reverse proxy config
├── dockercompose.yaml          # Full stack orchestration
├── vite.config.js              # Vite dev server + API proxy
├── package.json
└── README.md
```

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Docker | 24.x | Required for containerised deployment |
| Docker Compose | v2.x | Bundled with Docker Desktop |
| Node.js | 20.x | Local dev only — not needed for Docker |
| Python | 3.12 | Local dev only — not needed for Docker |
| MySQL | 8.0 | Local dev only — Docker uses the `db` service |

---

## Local Development

### 1. Clone and install frontend dependencies

```bash
git clone <your-repo-url>
cd universe-capital
npm install
```

### 2. Set up Python environment

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Provision a local MySQL database

```sql
-- Run as MySQL root
CREATE DATABASE universe_capital
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'universe_user'@'localhost' IDENTIFIED BY 'your_password';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
  ON universe_capital.* TO 'universe_user'@'localhost';

FLUSH PRIVILEGES;
```

The app auto-runs `schema.sql` on first boot — no manual import required.

### 4. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set MYSQL_PASSWORD, SECRET_KEY, ADMIN_TOKEN
```

### 5. Start the API

```bash
cd backend
FLASK_ENV=development python app.py
# API available at http://localhost:5000
```

### 6. Start the frontend dev server

```bash
# From project root
npm run dev
# Site available at http://localhost:5173
# /api/* requests are proxied to Flask via vite.config.js
```

---

## Docker Deployment

### Full stack (recommended)

```bash
# 1. Configure secrets
cp backend/.env.example backend/.env
# Edit backend/.env before proceeding

# 2. Build and start all services
docker compose up --build

# Site  → http://localhost:8080
# API   → http://localhost:5000/api
# MySQL → localhost:3306 (remove port mapping in production)
```

### Useful commands

```bash
# Run in background
docker compose up --build -d

# View API logs
docker logs universe_api --tail 50 --follow

# View all service logs
docker compose logs --follow

# Rebuild only the API image
docker compose up --build api -d

# Stop and remove containers + volumes (wipes database)
docker compose down -v

# Stop without removing volumes (preserves database)
docker compose down
```

### Verify the deployment

```bash
# Health check
curl http://localhost:5000/api/health

# Expected response
# {"status": "ok", "db": "connected", "timestamp": "..."}

# Test contact form submission
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Test User", "email": "test@example.com", "message": "Hello"}'

# Verify DB row was written
docker exec -it universe_db mysql -u universe_user -puniverse_pass universe_capital \
  -e "SELECT id, full_name, email, submitted_at FROM enquiries;"
```

---

## Environment Variables

All secrets are loaded from `backend/.env`. Copy from `.env.example` and update before running.

| Variable | Default | Required | Notes |
|---|---|---|---|
| `FLASK_ENV` | `development` | Yes | `development` / `production` |
| `SECRET_KEY` | *(insecure)* | **Yes** | Change in production |
| `MYSQL_HOST` | `127.0.0.1` | Yes | Use `db` inside Docker Compose |
| `MYSQL_PORT` | `3306` | No | |
| `MYSQL_USER` | `universe_user` | Yes | |
| `MYSQL_PASSWORD` | *(empty)* | **Yes** | |
| `MYSQL_DB` | `universe_capital` | Yes | |
| `MYSQL_ROOT_PASSWORD` | *(insecure)* | **Yes** | Docker Compose only |
| `MYSQL_POOL_SIZE` | `5` | No | 10 in production |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Yes | Comma-separated list |
| `ADMIN_TOKEN` | *(insecure)* | **Yes** | Change in production |
| `SMTP_HOST` | *(empty = disabled)* | No | Leave empty to disable email |
| `SMTP_PORT` | `587` | No | |
| `SMTP_USER` | *(empty)* | No | |
| `SMTP_PASS` | *(empty)* | No | |
| `SMTP_FROM` | `noreply@universecapital.in` | No | |
| `SMTP_USE_TLS` | `true` | No | |
| `NOTIFY_TO` | `contact@universecapital.in` | No | Admin notification recipient |
| `PORT` | `5000` | No | Gunicorn bind port |
| `WEB_CONCURRENCY` | `2×CPU+1` | No | Gunicorn worker override |

---

## API Reference

### Public endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Health check + DB connectivity |
| `POST` | `/api/contact` | None | Submit contact/enquiry form |

### Admin endpoints (token required)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/enquiries` | Token | Paginated list with search/filter |
| `GET` | `/api/enquiries/<id>` | Token | Single enquiry detail |
| `PATCH` | `/api/enquiries/<id>/status` | Token | Update status and/or admin notes |
| `DELETE` | `/api/enquiries/<id>` | Token | Soft-archive an enquiry |
| `POST` | `/api/admin/purge-rate-limit` | Token | Purge stale rate-limit rows |

### Authentication

Pass the `ADMIN_TOKEN` via header or query string:

```bash
# Header
curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:5000/api/enquiries

# Query string
curl http://localhost:5000/api/enquiries?token=<ADMIN_TOKEN>
```

### POST `/api/contact` — request body

```json
{
  "full_name": "Arjun Sharma",
  "email":     "arjun@example.com",
  "phone":     "+91 98765 43210",
  "message":   "Interested in research collaboration."
}
```

**Rate limited** to 5 requests per IP per hour (MySQL-backed, no Redis).

On success (`201`): fires two async emails — admin notification + enquirer auto-reply.

### GET `/api/enquiries` — query parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | `1` | Page number |
| `per_page` | int | `20` | Results per page (max 100) |
| `status` | string | — | Filter: `new` / `read` / `replied` / `archived` |
| `q` | string | — | Full-text search across name, email, phone |

### PATCH `/api/enquiries/<id>/status` — request body

```json
{ "status": "replied", "notes": "Responded via email on 2025-01-15." }
```

Valid statuses: `new` · `read` · `replied` · `archived`

---

## Database Schema

| Table | Description |
|---|---|
| `enquiries` | Contact form submissions with IP, user agent, status, and admin notes |
| `rate_limit_log` | Per-IP/endpoint/hour counters (replaces Redis for rate limiting) |
| `admin_users` | Admin panel accounts scaffold (bcrypt password hashes) |
| `schema_migrations` | Applied migration version tracking |

The schema is defined in `backend/schema.sql` and applied automatically via `db.py` on every startup using `CREATE TABLE IF NOT EXISTS` — safe to re-run on an existing database.

**Migrate an existing database** (if columns were added/removed):

```bash
docker exec -it universe_db mysql -u universe_user -puniverse_pass universe_capital \
  -e "ALTER TABLE enquiries ADD COLUMN new_col VARCHAR(100) DEFAULT NULL;"
```

---

## Email Notifications

Set `SMTP_HOST` in `backend/.env` to enable. When a form is submitted, two emails fire asynchronously (daemon thread — does not block the API response):

1. **Admin notification** — sent to `NOTIFY_TO` with full enquiry details. `Reply-To` is set to the enquirer's address for one-click reply from your inbox.
2. **Enquirer auto-reply** — sent to the person who submitted the form, confirming receipt and providing a reference ID.

To disable email entirely, leave `SMTP_HOST` empty (default). All other SMTP config is ignored.

**Example SMTP config (Gmail):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@universecapital.in
SMTP_USE_TLS=true
NOTIFY_TO=contact@universecapital.in
```

---

## Production Notes

**Before going live, change all defaults in `backend/.env`:**

```env
SECRET_KEY=<random-64-char-string>
ADMIN_TOKEN=<random-32-char-string>
MYSQL_PASSWORD=<strong-password>
MYSQL_ROOT_PASSWORD=<strong-password>
FLASK_ENV=production
CORS_ORIGINS=https://universecapital.in
```

**Remove the MySQL port binding** from `dockercompose.yaml` in production so the database is not exposed to the public internet:

```yaml
# Remove or comment out:
# ports:
#   - "3306:3306"
```

**Logo:** Place your brand logo at `public/company.png` before building the frontend image. The `Brand` component renders it at 120×48 px with `object-fit: contain`.

**HTTPS:** Terminate SSL/TLS at a load balancer or an upstream Nginx instance. The internal Nginx container serves plain HTTP and is designed to sit behind a TLS-terminating proxy in production.

---

*UNiverse Capital · India · Quantitative Investment Management*
