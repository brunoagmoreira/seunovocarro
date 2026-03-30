FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat openssl

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

# 3. Build
COPY --from=builder /app/out/full/ ./
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npx turbo build --filter=@seunovocarro/api --no-cache

# 4. Runner
FROM base AS runner
WORKDIR /app

# Ensure we have a user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

# Copy the entire build output to maintain all monorepo paths
COPY --from=installer --chown=nestjs:nodejs /app /app

USER nestjs
EXPOSE 80
ENV PORT 80
ENV NODE_ENV production

# Force the entrypoint to the exact location where Nest builds to
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
