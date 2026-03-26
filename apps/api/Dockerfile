FROM node:20-alpine AS alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

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
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate prisma client inside the api folder
COPY --from=builder /app/out/full/ ./
RUN cd apps/api && npx prisma generate

# 3. Build
RUN pnpm turbo run build --filter=@seunovocarro/api...

# 4. Runner
FROM alpine AS runner
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
