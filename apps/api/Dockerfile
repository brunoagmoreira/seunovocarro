# FINAL "MATCH THE WEB" DOCKERFILE: Alpine para Simetria Total com o Frontend
FROM node:20-alpine

# 1. Instalar dependências nativas para Alpine (Essencial para Prisma e Turbo)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 2. Instalar turbo globalmente
RUN npm i -g turbo

# 3. Copiar o projeto INTEIRO
COPY . .

# 4. Instalar dependências (Alpine + libc6-compat lida bem com isso)
RUN npm ci

# 5. Gerar cliente Prisma para Alpine
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# 6. Build da API
RUN npm run build:api -- --no-cache

# 7. Configurações de execução
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

# Iniciar a partir da raiz ou da pasta do app (WORKDIR atual é /app)
# Usar node direto para evitar sobrecarga de processos
CMD ["node", "apps/api/dist/main.js"]
