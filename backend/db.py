"""
db.py — MySQL connection pool for UNiverse Capital.

Uses mysql-connector-python's built-in connection pooling.
Each request gets a connection from the pool via Flask's
`g` object and returns it automatically at teardown.
"""

import logging
from typing import Optional

import mysql.connector
from mysql.connector import pooling, Error as MySQLError
from flask import g, current_app

log = logging.getLogger("universe.db")

# Module-level pool singleton — initialised once per worker process.
_pool: Optional[pooling.MySQLConnectionPool] = None


# ── Pool initialisation ───────────────────────────────────────────────────────

def init_db(app) -> None:
    """
    Create the connection pool and ensure the schema exists.
    Call this once inside the application context at startup.
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

    try:
        _pool = pooling.MySQLConnectionPool(**cfg)
        log.info(
            "MySQL pool '%s' created (size=%d, host=%s:%s, db=%s)",
            cfg["pool_name"],
            cfg["pool_size"],
            cfg["host"],
            cfg["port"],
            cfg["database"],
        )
    except MySQLError as exc:
        log.critical("Cannot create MySQL pool: %s", exc)
        raise

    _run_migrations(app)


def _run_migrations(app) -> None:
    """Apply schema.sql idempotently on every startup."""
    schema_path = app.root_path + "/../backend/schema.sql"
    try:
        with open(schema_path, "r", encoding="utf-8") as fh:
            raw = fh.read()
    except FileNotFoundError:
        # Fallback: schema file is in same directory as db.py
        import os
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        with open(schema_path, "r", encoding="utf-8") as fh:
            raw = fh.read()

    statements = [s.strip() for s in raw.split(";") if s.strip()]
    conn = _pool.get_connection()
    cur = conn.cursor()
    try:
        for stmt in statements:
            cur.execute(stmt)
        conn.commit()
        log.info("Schema migration applied successfully.")
    except MySQLError as exc:
        conn.rollback()
        log.error("Schema migration error: %s", exc)
        raise
    finally:
        cur.close()
        conn.close()


# ── Per-request helpers ───────────────────────────────────────────────────────

def get_db():
    """
    Return the per-request database connection.
    Borrows a connection from the pool and stores it in Flask's `g`.
    """
    if "db" not in g:
        if _pool is None:
            raise RuntimeError("Database pool not initialised. Call init_db() first.")
        try:
            g.db = _pool.get_connection()
        except MySQLError as exc:
            log.error("Cannot borrow connection from pool: %s", exc)
            raise
    return g.db


def close_db(exc=None) -> None:
    """Return the connection to the pool at the end of each request."""
    db = g.pop("db", None)
    if db is not None:
        try:
            if db.is_connected():
                db.close()   # returns to pool, not truly closed
        except MySQLError as e:
            log.warning("Error returning connection to pool: %s", e)