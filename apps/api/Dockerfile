FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat openssl

WORKDIR /app

# Em vez de prune (que está falhando), vamos usar o projeto completo para garantir caminhos
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma

# Instalar dependências de todo o monorepo (mais seguro para paths)
RUN npm ci

# Copiar o código fonte completo da API e pacotes necessários
COPY apps/api ./apps/api
COPY packages ./packages

# Build da API
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build:api -- --no-cache

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
USER nestjs

# Copiar tudo que foi construído
COPY --from=base --chown=nestjs:nodejs /app /app

EXPOSE 80
ENV PORT 80
ENV NODE_ENV production

# Iniciar a API diretamente da pasta dela
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
