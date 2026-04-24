# Prisma em produção (P3005 / baseline)

## Erro `P3005`

Significa: o banco **já tem tabelas**, mas o Prisma **nunca aplicou migrações** por esse histórico (tabela `_prisma_migrations` vazia ou inexistente). O `migrate deploy` não aplica a primeira migração em schema “não vazio” sem **baseline**.

## O que o Docker da API faz hoje

No `CMD` da imagem:

1. Tenta `prisma migrate deploy`.
2. Se falhar (incluindo P3005), roda `prisma db push` para **alinhar o schema** ao `schema.prisma` sem depender do histórico de migrações.

Assim o container sobe e colunas novas (ex.: Google em `site_settings`) são criadas quando faltam.

## Caminho “só migrate” (opcional)

Para usar só `migrate deploy` no futuro:

1. Siga o guia oficial: [Baselining a database](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/add-prisma-migrate-to-a-project#baseline-your-production-environment).
2. Em resumo: marcar migrações já refletidas no BD como aplicadas com `prisma migrate resolve`, sem reexecutar o SQL.

Até lá, o fallback `db push` no container evita ficar preso no P3005.
