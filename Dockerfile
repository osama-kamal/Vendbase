# Single-image public demo: builds the React client and serves it from the API
# process, so the whole demo fits in one free-tier service.
# Build context is the repository root (set Railway root directory to "/").

# ── Client build ──────────────────────────────────────────────────────────────
FROM node:20-slim AS client-build
WORKDIR /client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
ENV VITE_DEMO_MODE=true
RUN npm run build

# ── API build ─────────────────────────────────────────────────────────────────
FROM node:20-slim AS api-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=api-build /app/dist ./dist
COPY --from=client-build /client/dist ./public
USER node
EXPOSE 5000
CMD ["sh", "-c", "node dist/scripts/seed-demo.js && node dist/server.js"]
