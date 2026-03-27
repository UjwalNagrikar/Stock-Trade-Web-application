# ============================================================
# backend/Dockerfile — Flask + Gunicorn API image
# Build context: ./backend
# ============================================================

# ── Stage 1: dependency builder ───────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# Install system deps needed to build mysql-connector-python
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        default-libmysqlclient-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: production runtime ───────────────────────────────
FROM python:3.12-slim AS runtime

# Non-root user for security
RUN useradd --system --no-create-home --shell /bin/false appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Remove test files from production image
RUN rm -rf tests/ .env.example

# Set ownership
RUN chown -R appuser:appuser /app

USER appuser

ENV FLASK_ENV=production \
    PORT=5000 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health')"

CMD ["gunicorn", "-c", "gunicorn.conf.py", "wsgi:app"]