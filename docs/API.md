# API Seu Novo Carro (NestJS)

Todas as rotas HTTP usam o prefixo global **`/api`**.

## Documentação interativa (Swagger / OpenAPI)

- **URL:** `{ORIGEM_DA_API}/api/docs`  
  Exemplos: `http://localhost:3001/api/docs`, `https://api.seunovocarro.com.br/api/docs`
- **JSON OpenAPI:** `{ORIGEM_DA_API}/api/docs-json` (útil para importar no Postman ou gerar clientes).
- **Produção:** o Swagger fica **desligado** por padrão. Para ativar no servidor da API, defina  
  `SWAGGER_ENABLED=true`  
  (e faça redeploy). Em `NODE_ENV !== 'production'` ele fica ligado automaticamente.

Na UI do Swagger use **Authorize** e cole o JWT (`Bearer` é preenchido automaticamente após colar o token).

## Autenticação

- **Público:** `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/google`
- **Protegido:** header `Authorization: Bearer <access_token>` (JWT emitido no login/cadastro/Google).

## Grupos principais de rotas

| Prefixo | Descrição |
|--------|-----------|
| `GET /api/health` | Health check |
| `/api/auth/*` | Login, cadastro, Google |
| `GET /api/site-settings/public` | Pixels + Google Client ID (sem segredo) |
| `/api/admin/*` | Painel admin (JWT + role `admin`) — dashboard, usuários, planos lojista, site-settings, aprovações, etc. |
| `/api/users/*` | Perfil do usuário autenticado |
| `/api/vehicles/*` | Veículos públicos e rotas autenticadas do vendedor |
| `/api/vehicles/admin/*` | Admin de veículos (JWT admin; opcional header `X-SNC-Admin-Vehicle-Key` se `ADMIN_VEHICLE_DATA_SECRET` estiver definido) |

Documentação detalhada de corpos de requisição, códigos e modelos: use o **Swagger** acima.

## Documentação complementar

- [API — veículos admin (integração)](API-VEICULOS-ADMIN.md)
