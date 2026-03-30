# SINGLE STAGE FIX: Mais pesado, porém 100% à prova de erro de caminho ou permissão
FROM node:20-bookworm-slim

WORKDIR /app

# Instalar dependências do sistema necessárias para o Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Instalar turbo globalmente
RUN npm i -g turbo

# Copiar o projeto INTEIRO de uma vez (evita erros de caminhos relativos no monorepo)
COPY . .

# Instalar TODAS as dependências do monorepo
RUN npm ci

# Gerar o cliente Prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build da API
RUN npm run build:api -- --no-cache

# Configurações de execução
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

# Iniciar a API a partir da pasta dela para garantir que o dist/main.js seja encontrado
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
