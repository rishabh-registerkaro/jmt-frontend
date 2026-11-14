# Example:
#   docker build -t jmt-frontend \
#     --build-arg SITE_URL=https://www.example.com \
#     --build-arg ADMIN_API_URL=https://admin.example.com \
#     --build-arg MEDIA_HOSTNAMES=media.example.com \
#     --build-arg PRODUCTION_URL=https://www.example.com \
#     --build-arg REQUIRE_PROD_ENV=1 \
#     .
#   docker run -d -p 3002:3002 --env-file .env jmt-frontend
#
# Build args (none of them is a secret; they end up in the prerendered HTML):
#   SITE_URL          canonicals, og:url, JSON-LD and the sitemap are prerendered
#   ADMIN_API_URL     the build fetches the live CMS content from it
#   PRODUCTION_URL    prefix of relative CMS links in the prerendered pages
#   MEDIA_HOSTNAMES   image optimizer allow-list, baked into the build
#   DISABLE_IMAGE_OPTIMIZATION=1   optional: keep the optimizer off
#   REQUIRE_PROD_ENV=1             optional: fail the build when SITE_URL or
#                                  ADMIN_API_URL is missing or is localhost
# Without them the build still works (localhost URLs, bundled content, images
# served as-is) — fine for a local test image, wrong for production.
ARG MEDIA_HOSTNAMES=""
ARG DISABLE_IMAGE_OPTIMIZATION=""

# ── Build ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Exact versions from package-lock.json.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG SITE_URL=""
ARG ADMIN_API_URL=""
ARG PRODUCTION_URL=""
ARG MEDIA_HOSTNAMES
ARG DISABLE_IMAGE_OPTIMIZATION
ARG REQUIRE_PROD_ENV=""
ENV NEXT_TELEMETRY_DISABLED=1 \
    SITE_URL=$SITE_URL \
    ADMIN_API_URL=$ADMIN_API_URL \
    PRODUCTION_URL=$PRODUCTION_URL \
    MEDIA_HOSTNAMES=$MEDIA_HOSTNAMES \
    DISABLE_IMAGE_OPTIMIZATION=$DISABLE_IMAGE_OPTIMIZATION \
    REQUIRE_PROD_ENV=$REQUIRE_PROD_ENV
# jmt-admin need not be reachable here: the build falls back to the bundled
# content and the live content takes over on the first revalidation.
# REVALIDATE_SECRET is never a build arg: it is a secret, passed at runtime.
RUN npm run build \
 && npm prune --omit=dev

# ── Run ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS run
WORKDIR /app

# The image settings are read again by `next start` and must match the build,
# so they are carried over. Do not override them at runtime: rebuild instead.
ARG MEDIA_HOSTNAMES
ARG DISABLE_IMAGE_OPTIMIZATION
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3002 \
    HOSTNAME=0.0.0.0 \
    MEDIA_HOSTNAMES=$MEDIA_HOSTNAMES \
    DISABLE_IMAGE_OPTIMIZATION=$DISABLE_IMAGE_OPTIMIZATION

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next ./.next

# The ISR cache is written to .next at runtime, so it must be owned by `node`.
USER node
EXPOSE 3002

# ADMIN_API_URL, REVALIDATE_SECRET, SITE_URL and PRODUCTION_URL are passed at
# runtime as well (same values as the build args): docker run --env-file .env …
CMD ["npm", "run", "start"]
