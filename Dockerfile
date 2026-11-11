# ── Build ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Exact versions from package-lock.json.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# jmt-admin need not be reachable here: the build falls back to the bundled
# content and the live content takes over on the first revalidation.
RUN npm run build \
 && npm prune --omit=dev

# ── Run ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS run
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3002 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next ./.next

# The ISR cache is written to .next at runtime, so it must be owned by `node`.
USER node
EXPOSE 3002

# Secrets (ADMIN_API_URL, REVALIDATE_SECRET, SITE_URL, PRODUCTION_URL) are
# passed at runtime: docker run --env-file .env …
CMD ["npm", "run", "start"]
