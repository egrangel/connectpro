# Connect — Plataforma de Classificados Profissionais

Diretório público de profissionais com navegação e busca sem login, portal
administrativo autenticado para gestão de anúncios, contas opcionais de
usuário para avaliações (1–5 estrelas) e personalização visual (banner, cores
e marca) configurável pelo admin.

O plano técnico completo está em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions) + **Tailwind CSS 4**
- **Prisma 6** — PostgreSQL (dev e produção)
- **Zod 4** para validação, **bcryptjs** para senhas, sessões em banco com cookie HttpOnly
- **Vercel Blob** para fotos em produção (disco local em dev)
- **Vitest** para testes unitários

## Como rodar

Requer um PostgreSQL acessível (local, ou gratuito via Prisma Postgres / Neon /
Supabase) apontado por `DATABASE_URL`.

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL e SEED_ADMIN_PASSWORD
npm run db:migrate          # aplica as migrações no PostgreSQL
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
- **Uploads**: validados por magic bytes (JPEG/PNG/WebP/SVG, máx. 10 MB), nome
  de arquivo gerado no servidor. Com `BLOB_READ_WRITE_TOKEN` definido vão para
  o Vercel Blob; sem ele, para `public/uploads/` (driver local de dev).

## Deploy na Vercel

1. Crie um banco PostgreSQL (aba **Storage** do projeto na Vercel — Neon /
   Prisma Postgres — ou qualquer provedor) e defina `DATABASE_URL` nas
   variáveis de ambiente do projeto.
2. Crie um **Blob store** (Storage → Blob); a Vercel injeta
   `BLOB_READ_WRITE_TOKEN` automaticamente.
3. Importe o repositório na Vercel. O script `vercel-build` roda
   `prisma migrate deploy` antes do build, então as migrações são aplicadas a
   cada deploy (o `postinstall` já cuida do `prisma generate`).
4. Para popular o banco inicial (admin + categorias), rode localmente com o
   `DATABASE_URL` de produção: `npm run db:seed` (usa `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD` do `.env`).

Limitações conhecidas na Vercel:

- Corpo de requisição limitado a ~4,5 MB — envie fotos maiores que isso uma
  de cada vez ou reduza o tamanho antes do upload.
- O rate-limit em memória (`src/lib/rate-limit.ts`) é por instância
  serverless; para garantia real em escala, troque por Redis/Upstash.

## Evoluções opcionais em escala

- Substitua a busca por `searchText contains` por full-text search nativa
  (`tsvector` + `pg_trgm`) dentro de `src/modules/listings/service.ts` — a
  interface pública do serviço não muda.
