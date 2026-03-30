# Definitivo: Usando Debian Slim para máxima compatibilidade com Prisma e monorepo
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Instalação global do turbo
RUN npm i -g turbo

# Copiar os arquivos de configuração do monorepo
COPY package.json package-lock.json turbo.json ./
# Copiar as definições de todos os pacotes e apps
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Instalar dependências (mais seguro no root para monorepos)
RUN npm ci

# Copiar o restante do código fonte
COPY . .

# Gerar o cliente Prisma explicitamente
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build da API (usando o script do root que já está configurado corretamente)
RUN npm run build:api -- --no-cache

# Estágio Final
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Instalar SSL e CA Certificates (necessário para Prisma/DB externa)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Configuração de usuário não-root
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nestjs
USER nestjs

# Copiar TODO o diretório de build para não haver erro de "módulo não encontrado"
# O monorepo precisa do node_modules do root e da pasta apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app /app

# Variáveis de Ambiente de produção
ENV NODE_ENV production
ENV PORT 80

# Expor a porta 80 (padrão de sucesso do seu servidor)
EXPOSE 80

# Iniciar a API diretamente da pasta apps/api
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
