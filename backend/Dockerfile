# ===== backend/Dockerfile =====
# Uses uv for fast, reproducible dependency installation.
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

# Install uv (the fast Python package manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

# Copy dependency manifest and install production deps only
COPY pyproject.toml .
RUN uv venv /app/.venv \
    && uv pip install .

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