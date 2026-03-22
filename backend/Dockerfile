# ────────────────────────────────────────────────
# Stage 1 — builder: install all deps & compile TS
# ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./
COPY prisma ./prisma/

# --ignore-scripts skips Prisma's postinstall binary download (avoids ECONNRESET);
# prisma generate is run explicitly in the next step instead.
RUN npm ci --ignore-scripts

# Download Prisma engines & generate the typed client
RUN npx prisma generate

COPY . .

RUN npm run build

# ────────────────────────────────────────────────
# Stage 2 — deps: prune devDependencies
# ────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Remove devDependencies (TypeScript, ts-node, @types/*, rimraf, etc.)
# Cuts node_modules from ~600 MB to ~200 MB
RUN npm prune --production

# ────────────────────────────────────────────────
# Stage 3 — runner: lean production image
# ────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl \
    # Run as non-root for container security
    && addgroup -S appgroup \
    && adduser  -S appuser -G appgroup

# Only production node_modules (no devDeps)
COPY --from=deps    /app/node_modules    ./node_modules
# Compiled JS output
COPY --from=builder /app/dist           ./dist
# Prisma schema (needed by db push at runtime)
COPY --from=builder /app/prisma         ./prisma
COPY package*.json ./

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER appuser

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]

# Call node directly — avoids npm process overhead at startup
CMD ["node", "dist/server.js"]
