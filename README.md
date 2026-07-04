# Connect — Plataforma de Classificados Profissionais

Diretório público de profissionais com navegação e busca sem login, portal
administrativo autenticado para gestão de anúncios, contas opcionais de
usuário para avaliações (1–5 estrelas) e personalização visual (banner, cores
e marca) configurável pelo admin.

O plano técnico completo está em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions) + **Tailwind CSS 4**
- **Prisma 6** — SQLite em desenvolvimento, PostgreSQL como alvo de produção
- **Zod 4** para validação, **bcryptjs** para senhas, sessões em banco com cookie HttpOnly
- **Vitest** para testes unitários

## Como rodar

```bash
npm install
cp .env.example .env        # ajuste SEED_ADMIN_PASSWORD
npm run db:migrate          # cria o banco SQLite e aplica migrações
npm run db:seed             # admin + categorias + anúncios de exemplo
npm run dev                 # http://localhost:3000
```

Login do admin: o e-mail/senha definidos em `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` no `.env`. O portal fica em `/admin`.

Usuários de demonstração (para testar avaliações): `joana@example.com` e
`pedro@example.com`, senha `senha-demo-123`.

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm test` | Testes unitários (Vitest) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Popula admin, categorias e anúncios de exemplo |

## Estrutura

```
src/
├── app/            # rotas públicas, login/register e /admin (portal)
├── components/     # UI: site, listings, reviews, search, ui
├── lib/            # prisma, auth (sessões/senha), rate-limit, text, constants
└── modules/        # domínio: listings, reviews, categories, settings, auth, media
prisma/             # schema, migrações e seed
```

Regras centrais:

- **Papéis**: `USER` (avalia) e `ADMIN` (gerencia tudo). O cadastro público
  **sempre** cria `USER`; admin só via seed ou promoção por outro admin.
- **Avaliações**: 1–5 estrelas, uma por usuário por anúncio (constraint única
  no banco), média/contagem denormalizadas e recalculadas em transação.
- **Tema**: tokens (cores hex validadas + raio) gravados em `SiteSettings` e
  injetados como CSS variables no layout raiz — sem CSS livre (evita XSS).
- **Uploads**: validados por magic bytes (JPEG/PNG/WebP, máx. 10 MB), nome de
  arquivo gerado no servidor, gravados em `public/uploads/` (driver local).

## Migrando para PostgreSQL (produção)

1. Troque o provider em `prisma/schema.prisma` para `postgresql` e aponte
   `DATABASE_URL` para o banco.
2. Regenere as migrações (`prisma migrate dev`) em um banco novo.
3. Opcional, em escala: substitua a busca por `searchText contains` por
   full-text search nativa (`tsvector` + `pg_trgm`) dentro de
   `src/modules/listings/service.ts` — a interface pública do serviço não muda.
4. Substitua o driver de mídia local (`src/modules/media/storage.ts`) por
   S3/R2 com URLs pré-assinadas, mantendo a mesma interface.
5. Troque o rate-limit em memória (`src/lib/rate-limit.ts`) por Redis se
   houver múltiplas instâncias.
