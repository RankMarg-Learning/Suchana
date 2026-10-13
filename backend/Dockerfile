# ────────────────────────────────────────────────
# Stage 1 — builder: compile TypeScript & generate Prisma
# ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Fast deterministic install from lockfile
RUN npm ci --ignore-scripts --no-audit

# Generate Prisma client for linux-musl-openssl-3.0.x
RUN npx prisma generate

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to dist/ and ensure config assets are present
RUN npm run build && \
    mkdir -p dist/config/rules && \
    cp src/config/rules/*.json dist/config/rules/ 2>/dev/null || true

# ────────────────────────────────────────────────
# Stage 2 — deps: production dependencies only
# ────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# Install ONLY production dependencies (clean, no devDependencies, no ts-node/tsc)
RUN npm ci --omit=dev --ignore-scripts --no-audit && \
    npm cache clean --force

# Copy generated Prisma Client & engine from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Prune documentation, markdown, type definitions, source maps, and test folders from node_modules
RUN find node_modules -type f \( \
      -name "*.md" -o -name "*.markdown" -o -name "*.d.ts" -o -name "*.map" -o \
      -name "LICENSE*" -o -name "CHANGELOG*" -o -name ".npmignore" -o \
      -name ".eslintrc*" -o -name "tsconfig.json" \
    \) -delete && \
    find node_modules -type d \( \
      -name "test" -o -name "tests" -o -name "__tests__" -o \
      -name "example" -o -name "examples" -o -name ".github" \
    \) -exec rm -rf {} + 2>/dev/null || true

# ────────────────────────────────────────────────
# Stage 3 — runner: lean production image (~160-200MB)
# ────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# openssl is required for Prisma runtime on Alpine
RUN apk add --no-cache openssl && \
    addgroup -S -g 1001 appgroup && \
    adduser  -S -u 1001 -G appgroup appuser

# Copy production artifacts with non-root ownership
COPY --from=deps    --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist         ./dist
COPY --from=builder --chown=appuser:appgroup /app/prisma       ./prisma
COPY --chown=appuser:appgroup package.json ./

COPY --chown=appuser:appgroup docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER appuser

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["node", "dist/server.js"]
