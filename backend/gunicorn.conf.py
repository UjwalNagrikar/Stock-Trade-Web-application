"""
gunicorn.conf.py — Production Gunicorn config for UNiverse Capital.
Run with:  gunicorn -c gunicorn.conf.py wsgi:app
"""

import multiprocessing
import os

# ── Workers ───────────────────────────────────────────────────
workers     = int(os.getenv("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))
worker_class = "sync"          # switch to "gevent" if you add gevent
threads     = 2
timeout     = 30
keepalive   = 5

# ── Networking ───────────────────────────────────────────────
bind        = f"0.0.0.0:{os.getenv('PORT', '5000')}"

# ── Logging ───────────────────────────────────────────────────
accesslog   = "-"              # stdout — captured by your log driver
errorlog    = "-"
loglevel    = os.getenv("LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" %(D)sµs'

# ── Process ───────────────────────────────────────────────────
preload_app  = True            # share pool across workers after fork
daemon       = False
proc_name    = "universe-capital-api"