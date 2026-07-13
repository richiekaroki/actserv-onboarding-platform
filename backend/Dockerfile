# ===== backend/Dockerfile =====
# Multi-stage build: builder installs deps, final image copies the venv.

# ── Stage 1: dependency builder ──────────────────────────────────────────────
FROM python:3.13-slim AS builder

WORKDIR /app

# Install system libraries needed to compile psycopg2 & image libs
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
       gcc \
       python3-dev \
       libjpeg-dev \
       zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Create venv and install dependencies
RUN python -m venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Install production dependencies only (skip [dev] extras)
COPY pyproject.toml .
RUN pip install --no-cache-dir . 2>/dev/null || pip install --no-cache-dir \
    django==5.2.6 \
    djangorestframework==3.16.1 \
    djangorestframework-simplejwt==5.5.1 \
    drf-spectacular==0.28.0 \
    PyJWT==2.10.1 \
    psycopg2-binary==2.9.10 \
    dj-database-url==2.3.0 \
    celery==5.5.3 \
    redis==6.4.0 \
    kombu==5.5.4 \
    amqp==5.3.1 \
    billiard==4.2.2 \
    vine==1.0.3 \
    django-cors-headers==4.9.0 \
    whitenoise==6.11.0 \
    gunicorn==23.0.0 \
    sentry-sdk==2.35.0 \
    django-ratelimit==4.1.0 \
    python-dotenv==1.1.1 \
    python-dateutil==2.9.0.post0 \
    tzdata==2025.2 \
    sqlparse==0.5.3 \
    packaging==25.0

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.13-slim

WORKDIR /app

# Runtime system deps only (no build tools)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libpq5 \
       libjpeg62-turbo \
       zlib1g \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

# Copy the pre-built venv from builder
COPY --from=builder /app/.venv /app/.venv

# Copy project source
COPY . .

RUN chmod +x start.sh

EXPOSE 8000

# Run migrations then start gunicorn
CMD ["./start.sh"]
