# DOCKERFILE FINAL: Caminho de Execução Monorepo Corrigido
FROM node:20-alpine

# 1. Instalar dependências nativas para Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 2. Instalar turbo globalmente
RUN npm i -g turbo

# 3. Copiar o projeto INTEIRO
COPY . .

# 4. Instalar dependências
RUN npm ci

# 5. Gerar cliente Prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# 6. Build da API (O NestJS coloca o resultado em dist/apps/api/)
RUN npm run build:api -- --no-cache

# 7. Configurações de execução
ENV NODE_ENV production
ENV PORT 3001
EXPOSE 3001

# Aplica migrações pendentes (ex.: colunas novas) antes de subir a API
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && exec node apps/api/dist/src/main.js"]
