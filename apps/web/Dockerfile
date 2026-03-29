FROM node:20-alpine AS alpine

FROM alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat

# 1. Prune the workspace
FROM base AS builder
WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune @seunovocarro/web --docker

# 2. Install dependencies
FROM base AS installer
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# 3. Build the project
COPY --from=builder /app/out/full/ .
RUN npx turbo run build --filter=@seunovocarro/web...

# 4. Final image Runner
FROM alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/web/next.config.ts .
COPY --from=installer /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
