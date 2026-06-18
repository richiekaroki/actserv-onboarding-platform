# frontend/Dockerfile
# Multi-stage build: deps → builder → runner
# Keeps the final image lean (~200 MB vs ~800 MB single-stage)

# ── Stage 1: install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline

# ── Stage 2: build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Stage 3: runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only copy what Next.js needs to run
COPY --from=builder /app/public        ./public
COPY --from=builder /app/.next/standalone  ./
COPY --from=builder /app/.next/static  ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]