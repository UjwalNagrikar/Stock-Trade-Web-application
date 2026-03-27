"""
rate_limit.py — Application-level rate limiting backed by MySQL.

Stores hit counts in the `rate_limit_log` table using an hourly
window key.  No Redis required.

Usage (inside a Flask route):
    from rate_limit import check_rate_limit, RateLimitExceeded
    try:
        check_rate_limit(request.remote_addr, "/api/contact", limit=5)
    except RateLimitExceeded as exc:
        return jsonify({"success": False, "message": str(exc)}), 429
"""

import logging
from datetime import datetime

from mysql.connector import Error as MySQLError

from db import get_db

log = logging.getLogger("universe.rate_limit")


class RateLimitExceeded(Exception):
    """Raised when a client exceeds the allowed call count for a time window."""
    def __init__(self, limit: int, window: str):
        self.limit  = limit
        self.window = window
        super().__init__(
            f"Rate limit of {limit} requests per hour exceeded. "
            f"Please try again later."
        )


def _window_key() -> str:
    """Returns a string like '2024-01-15_14' (YYYY-MM-DD_HH in UTC)."""
    now = datetime.utcnow()
    return now.strftime("%Y-%m-%d_%H")


def check_rate_limit(
    ip: str,
    endpoint: str,
    limit: int = 10,
) -> int:
    """
    Atomically increment the call counter for (ip, endpoint, window).
    Returns the new count.
    Raises RateLimitExceeded if the count exceeds `limit`.
    """
    window = _window_key()
    db = get_db()
    cur = db.cursor()
    try:
        # INSERT new row or increment existing one atomically
        cur.execute(
            """
            INSERT INTO rate_limit_log
                (ip_address, endpoint, window_key, call_count, last_seen)
            VALUES
                (%s, %s, %s, 1, NOW())
            ON DUPLICATE KEY UPDATE
                call_count = call_count + 1,
                last_seen  = NOW()
            """,
            (ip[:45], endpoint[:100], window),
        )
        db.commit()

        # Read back the current count
        cur.execute(
            """
            SELECT call_count FROM rate_limit_log
            WHERE  ip_address = %s AND endpoint = %s AND window_key = %s
            """,
            (ip[:45], endpoint[:100], window),
        )
        row = cur.fetchone()
        count = row[0] if row else 1

    except MySQLError as exc:
        log.error("Rate limit DB error: %s", exc)
        # On DB error, allow the request through (fail-open)
        return 0
    finally:
        cur.close()

    if count > limit:
        raise RateLimitExceeded(limit=limit, window=window)

    return count


def purge_old_windows(keep_hours: int = 48) -> int:
    """
    Delete rate_limit_log rows older than `keep_hours` hours.
    Run this periodically (e.g. daily cron) to keep the table small.
    Returns the number of rows deleted.
    """
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "DELETE FROM rate_limit_log WHERE last_seen < NOW() - INTERVAL %s HOUR",
            (keep_hours,),
        )
        db.commit()
        deleted = cur.rowcount
        log.info("Purged %d stale rate_limit_log rows.", deleted)
        return deleted
    except MySQLError as exc:
        db.rollback()
        log.error("Rate limit purge error: %s", exc)
        return 0
    finally:
        cur.close()