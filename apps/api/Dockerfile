# Cache buster: 2026-03-30-v2
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 1. Prune
FROM base AS builder
WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune @seunovocarro/api --docker

# 2. Install
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Generate prisma client inside the api folder
COPY --from=builder /app/out/full/ ./
RUN cd apps/api && npx prisma generate

# 3. Build — ARG CACHEBUST forces rebuild past this point
ARG CACHEBUST=1
RUN npx turbo run build --filter=@seunovocarro/api...

# 4. Runner
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy pruned node_modules and built resources
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer /app/apps/api/dist ./apps/api/dist
COPY --from=installer /app/apps/api/package.json ./apps/api/package.json
# Need generated schema definition for runtime querying
COPY --from=installer /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3001
CMD [ "node", "apps/api/dist/main.js" ]
