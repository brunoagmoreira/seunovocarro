FROM node:20-alpine AS alpine

FROM alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat openssl

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
RUN cd apps/api && npx prisma generate
RUN npx turbo run build --filter=@seunovocarro/api --no-cache

# 4. Runner
FROM alpine AS runner
WORKDIR /app

# Non-root user setup
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy EVERYTHING from installer to maintain monorepo structure and links
COPY --from=installer --chown=nestjs:nodejs /app /app

USER nestjs
EXPOSE 3001
ENV PORT 3001
ENV NODE_ENV production

# Start from the api project root
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
