# API — dados de veículos (acesso administrativo)

Documentação para **consumir e alterar dados de veículos com privilégio de administrador**. Estes endpoints expõem **todo o estoque** (incluindo rascunhos, pendentes e vendidos) e permitem alterar status e destaque.

---

## Visão geral de segurança

| Camada | O que faz |
|--------|-----------|
| **HTTPS** | Obrigatório em produção. Nunca chame a API com token em HTTP claro. |
| **JWT + papel `admin`** | Todos os endpoints abaixo exigem `Authorization: Bearer <access_token>` de um usuário com `role: admin` no banco. Tokens de editor ou usuário comum recebem **403 Forbidden**. |
| **Chave de integração (opcional)** | Se a variável de ambiente `ADMIN_VEHICLE_DATA_SECRET` estiver definida na API, é obrigatório também o header **`X-SNC-Admin-Vehicle-Key`** com o **mesmo** valor. Isso reduz risco de uso indevido mesmo com JWT vazado (ex.: exige compromisso de duas chaves). Recomendado para **scripts, ETL ou backends** que não sejam o painel web. |
| **Infraestrutura** | Restringir por IP no reverse proxy (Cloudflare / nginx), rate limiting e WAF são recomendados para rotas administrativas. |

**O painel web admin** continua funcionando sem a chave opcional, desde que `ADMIN_VEHICLE_DATA_SECRET` **não** esteja definida. Para exigir a chave em produção, defina o segredo no ambiente da API e envie o mesmo header em todas as integrações.

---

## Base URL e prefixo

- **Prefixo global Nest:** `/api`
- Exemplo produção: `https://api.seunovocarro.com.br/api`
- Rotas de veículos ficam em: `{BASE}/vehicles/...`

Substitua `{BASE}` por `https://<seu-host>/api` (sem barra final).

---

## 1. Obter token (login)

Somente contas com papel **admin** podem usar os endpoints da secção 2.

```http
POST {BASE}/auth/login
Content-Type: application/json

{
  "email": "admin@exemplo.com",
  "password": "<senha>"
}
```

**Resposta 200 (exemplo):**

```json
{
  "access_token": "<JWT>",
  "user": {
    "id": "...",
    "email": "admin@exemplo.com",
    "role": "admin",
    "status": "active"
  }
}
```

Guarde `access_token` apenas em memória ou cofre (secret manager). **Não** commite tokens em repositórios.

---

## 2. Endpoints administrativos de veículos

Headers comuns:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Se `ADMIN_VEHICLE_DATA_SECRET` estiver ativo no servidor:

```http
X-SNC-Admin-Vehicle-Key: <mesmo valor do segredo>
```

### 2.1 Listar todos os veículos (admin)

Retorna **todos** os anúncios, qualquer status, com mídias e dados resumidos do vendedor.

```http
GET {BASE}/vehicles/admin/all
```

**Resposta 200:** array JSON de veículos (campos alinhados ao modelo Prisma `Vehicle`, incluindo `featured`, `status`, `media[]`, `seller`).

**Erros:**

| HTTP | Situação |
|------|----------|
| 401 | Token ausente, inválido ou expirado; ou chave `X-SNC-Admin-Vehicle-Key` inválida quando o segredo está configurado. |
| 403 | Token válido mas `role !== 'admin'`. |

---

### 2.2 Alterar status do anúncio

```http
PATCH {BASE}/vehicles/admin/{vehicleId}/status
```

**Body JSON:**

```json
{
  "status": "approved"
}
```

Valores de `status` (enum): `draft`, `pending`, `approved`, `sold`, `expired`.

**Comportamento:** ao mudar para um status diferente de `approved`, o campo **`featured`** é gravado como `false` automaticamente.

**Resposta 200:** objeto do veículo atualizado (campos principais conforme implementação atual do serviço).

**Erros:** 401, 403, 404 (id inexistente).

---

### 2.3 Destacar veículo na vitrine (home)

Só é permitido `featured: true` se o veículo já estiver **`approved`**.

```http
PATCH {BASE}/vehicles/admin/{vehicleId}/featured
```

**Body JSON:**

```json
{
  "featured": true
}
```

**Resposta 200:** veículo com `include` de `media` e `seller` (mesmo padrão da listagem admin em operações de atualização deste endpoint).

**Erros:**

| HTTP | Situação |
|------|----------|
| 400 | `featured: true` com veículo não publicado. |
| 401 / 403 / 404 | Igual aos anteriores. |

---

## 3. Exemplo com cURL

Substitua variáveis antes de executar.

```bash
BASE="https://api.seunovocarro.com.br/api"
EMAIL="admin@exemplo.com"
PASSWORD="***"
INTEGRATION_KEY=""   # opcional; se a API usa ADMIN_VEHICLE_DATA_SECRET, preencha o mesmo valor

TOKEN=$(curl -sS -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.access_token')

HDR_AUTH=(-H "Authorization: Bearer $TOKEN")
HDR_KEY=()
if [ -n "$INTEGRATION_KEY" ]; then
  HDR_KEY=(-H "X-SNC-Admin-Vehicle-Key: $INTEGRATION_KEY")
fi

curl -sS "${HDR_AUTH[@]}" "${HDR_KEY[@]}" "$BASE/vehicles/admin/all" | jq '.[0]'
```

---

## 4. Endpoints públicos de veículos (referência, não admin)

Não exigem JWT. **Não** expõem dados internos de moderação; servem ao site.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `{BASE}/vehicles` | Lista anúncios aprovados (uso geral do catálogo). |
| GET | `{BASE}/vehicles/featured?limit=4` | Vitrine da home (prioriza `featured`). |
| GET | `{BASE}/vehicles/count` | Contagem pública de aprovados. |
| GET | `{BASE}/vehicles/{slug}` | Detalhe por slug (público). |

Para **integrações que só precisam de estoque público**, prefira estes endpoints e **não** use credenciais admin.

---

## 5. Boas práticas para integração “muito segura”

1. **Conta dedicada** — Usuário admin usado só pela integração, senha forte e rotação; preferir não reutilizar o mesmo login humano.
2. **`ADMIN_VEHICLE_DATA_SECRET`** — Definir em produção e injetar o header apenas em servidores confiáveis (nunca no browser de usuários finais).
3. **Menor privilégio** — Se no futuro existir escopo somente-leitura, prefira-o para jobs que só leem estoque.
4. **Logs** — Não registrar `Authorization` nem `X-SNC-Admin-Vehicle-Key` em logs de acesso.
5. **Revogação** — Trocar `JWT_SECRET` invalida todos os JWTs; trocar `ADMIN_VEHICLE_DATA_SECRET` invalida integrações que usam a chave sem alterar senhas de usuário.
6. **Rede** — IP allowlist no proxy para `/api/vehicles/admin/*` quando o consumidor tiver IP fixo.

---

## 6. Resumo OpenAPI (trecho)

```yaml
openapi: 3.0.3
info:
  title: Seu Novo Carro — Veículos (Admin)
  version: "1.0"
servers:
  - url: https://api.seunovocarro.com.br/api
paths:
  /vehicles/admin/all:
    get:
      security: [{ bearerAuth: [] }]
      summary: Lista completa para administradores
  /vehicles/admin/{id}/status:
    patch:
      security: [{ bearerAuth: [] }]
      summary: Atualiza status do anúncio
  /vehicles/admin/{id}/featured:
    patch:
      security: [{ bearerAuth: [] }]
      summary: Ativa ou remove destaque na vitrine
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

*(Ajuste `servers.url` para o seu ambiente.)*

---

## 7. Onde está no código

- Controller: `apps/api/src/modules/vehicles/vehicles.controller.ts`
- Guard opcional: `apps/api/src/common/guards/admin-vehicle-integration.guard.ts`
- Variável de ambiente: `ADMIN_VEHICLE_DATA_SECRET` (ver `apps/api/.env.example`)

Dúvidas de contrato: priorize inspecionar o retorno real da API no ambiente de homologação antes de fixar tipos em clientes gerados.
