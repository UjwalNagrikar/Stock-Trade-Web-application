"""
db.py — MySQL connection pool for UNiverse Capital.

AUTO-BOOTSTRAP:
  On first startup the module connects to MySQL WITHOUT selecting a database,
  creates the target database if it does not exist, then builds the normal
  pool against that database and runs schema.sql idempotently.

  This means you only need a MySQL server running and valid credentials —
  no manual "CREATE DATABASE" step required.
"""

import logging
import os
from typing import Optional

import mysql.connector
from mysql.connector import pooling, Error as MySQLError
from flask import g

log = logging.getLogger("universe.db")

# Module-level pool singleton — initialised once per worker process.
_pool: Optional[pooling.MySQLConnectionPool] = None


# ── Bootstrap: ensure DB exists ───────────────────────────────────────────────

def _ensure_database_exists(cfg: dict) -> None:
    """
    Connect to MySQL without a database selected and CREATE DATABASE IF NOT EXISTS.
    This runs before the pool is created so it never fails on a fresh server.
    """
    log.info("Checking/creating database '%s' ...", cfg["database"])
    try:
        tmp = mysql.connector.connect(
            host=cfg["host"],
            port=cfg["port"],
            user=cfg["user"],
            password=cfg["password"],
            connection_timeout=10,
            use_pure=True,
        )
        cur = tmp.cursor()
        cur.execute(
            f"CREATE DATABASE IF NOT EXISTS `{cfg['database']}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        tmp.commit()
        cur.close()
        tmp.close()
        log.info("Database '%s' is ready.", cfg["database"])
    except MySQLError as exc:
        log.critical("Cannot bootstrap database: %s", exc)
        raise


# ── Pool initialisation ───────────────────────────────────────────────────────

def init_db(app) -> None:
    """
    1. Auto-create the database if it does not exist.
    2. Build the connection pool.
    3. Run schema.sql (all CREATE TABLE IF NOT EXISTS — safe to re-run).

    Call once inside the application context at startup.
    """
    global _pool

    cfg = {
        "pool_name":          app.config["MYSQL_POOL_NAME"],
        "pool_size":          app.config["MYSQL_POOL_SIZE"],
        "pool_reset_session": app.config["MYSQL_POOL_RESET_SESSION"],
        "host":               app.config["MYSQL_HOST"],
        "port":               app.config["MYSQL_PORT"],
        "user":               app.config["MYSQL_USER"],
        "password":           app.config["MYSQL_PASSWORD"],
        "database":           app.config["MYSQL_DB"],
        "charset":            "utf8mb4",
        "collation":          "utf8mb4_unicode_ci",
        "autocommit":         False,
        "connection_timeout": 10,
        "use_pure":           True,
    }

    # ── Step 1: guarantee the database exists ─────────────────────────────────
    _ensure_database_exists(cfg)

    # ── Step 2: create the connection pool ────────────────────────────────────
    try:
        _pool = pooling.MySQLConnectionPool(**cfg)
        log.info(
            "MySQL pool '%s' ready  (size=%d  host=%s:%s  db=%s)",
            cfg["pool_name"],
            cfg["pool_size"],
            cfg["host"],
            cfg["port"],
            cfg["database"],
        )
    except MySQLError as exc:
        log.critical("Cannot create MySQL pool: %s", exc)
        raise

    # ── Step 3: apply schema ──────────────────────────────────────────────────
    _run_schema()


# ── Schema runner ─────────────────────────────────────────────────────────────

def _run_schema() -> None:
    """
    Execute schema.sql against the pool.
    Every statement uses CREATE TABLE IF NOT EXISTS / INSERT IGNORE so
    re-running on an existing database is always safe.
    """
    # Locate schema.sql relative to this file
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")

    try:
        with open(schema_path, "r", encoding="utf-8") as fh:
            raw = fh.read()
    except FileNotFoundError:
        log.error("schema.sql not found at %s — skipping schema run.", schema_path)
        return

    # Split on ";" and skip blank / comment-only chunks
    statements = [
        s.strip()
        for s in raw.split(";")
        if s.strip() and not s.strip().startswith("--")
    ]

    conn = _pool.get_connection()
    cur  = conn.cursor()
    try:
        for stmt in statements:
            # Skip the USE / CREATE DATABASE lines — the pool already targets the DB
            low = stmt.lstrip().lower()
            if low.startswith("use ") or low.startswith("create database"):
                continue
            cur.execute(stmt)
        conn.commit()
        log.info("Schema applied successfully (%d statements).", len(statements))
    except MySQLError as exc:
        conn.rollback()
        log.error("Schema error: %s", exc)
        raise
    finally:
        cur.close()
        conn.close()


# ── Per-request helpers ───────────────────────────────────────────────────────

def get_db():
    """
    Return the per-request database connection.
    Borrows from the pool and caches it in Flask g for the request lifetime.
    """
    if "db" not in g:
        if _pool is None:
            raise RuntimeError("DB pool not initialised — call init_db() first.")
        try:
            g.db = _pool.get_connection()
        except MySQLError as exc:
            log.error("Cannot borrow connection from pool: %s", exc)
            raise
    return g.db


def close_db(exc=None) -> None:
    """Return the connection to the pool at end of each request."""
    db = g.pop("db", None)
    if db is not None:
        try:
            if db.is_connected():
                db.close()          # returns to pool — not a true close
        except MySQLError as e:
            log.warning("Error returning connection to pool: %s", e)