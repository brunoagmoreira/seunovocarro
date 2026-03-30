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

# 3. Build — Using direct turbo build and showing diagnostics
COPY --from=builder /app/out/full/ ./
RUN cd apps/api && npx prisma generate
RUN npx turbo run build --filter=@seunovocarro/api --no-cache
# Diagnostics: this will show up in your build logs
RUN ls -R apps/api/dist

# 4. Runner
FROM alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy essential files with absolute paths to be safe
COPY --from=installer /app/node_modules /app/node_modules
COPY --from=installer /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=installer /app/apps/api/dist /app/apps/api/dist
COPY --from=installer /app/apps/api/package.json /app/apps/api/package.json
COPY --from=installer /app/apps/api/prisma /app/apps/api/prisma

EXPOSE 3001
ENV PORT 3001
ENV NODE_ENV production

# Start from the api folder to avoid any path resolution issues
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]

