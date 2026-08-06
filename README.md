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
- **Resend** (API HTTP, sem SDK) para e-mail transacional — driver de console em dev
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

### Banco local para desenvolvimento

Para desenvolver sem depender do banco remoto, o projeto sobe um PostgreSQL
**real** dentro da própria pasta (`.localdb/`, ignorada pelo git) — mesmo motor
e mesmo dialeto da produção, sem instalar nada no sistema e sem privilégio de
administrador. Assim as migrações são ensaiadas localmente exatamente como
rodarão no deploy.

```bash
npm run db:local          # terminal 1: sobe o Postgres em localhost:5433 (deixe aberto)
npm run db:migrate:local  # terminal 2: aplica as migrações
npm run db:seed:local     # popula admin, categorias e anúncios
npm run dev:local         # http://localhost:3000 usando o banco local
```

Os comandos `*:local` passam `DATABASE_URL` explicitamente, então **não
alteram** `.env`, `.env.local` nem `.env.development.local` (este último é
gerado pelo `vercel env pull` e seria sobrescrito). Os comandos sem sufixo
(`npm run dev`, `db:migrate`, `db:seed`) continuam usando o `DATABASE_URL` dos
arquivos `.env`.

Para zerar a base local: `npm run db:local:reset` (apaga `.localdb/` e recria o
cluster; depois rode `db:migrate:local` e `db:seed:local` de novo).

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
| `npm run db:local` | Sobe o PostgreSQL local do projeto (`.localdb/`, porta 5433) |
| `npm run db:local:reset` | Apaga `.localdb/` e recria o cluster do zero |
| `npm run dev:local` | `next dev` apontado para o banco local |
| `npm run db:migrate:local` | Migrações no banco local |
| `npm run db:seed:local` | Seed no banco local |

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
- **Recuperação de senha**: `/forgot-password` gera um token de 256 bits válido
  por 60 minutos e envia o link por e-mail; o banco guarda apenas o SHA-256 do
  token. A tela responde igual para e-mail cadastrado ou não (não revela quem
  tem conta). Ao redefinir em `/reset-password`, o token é apagado e **todas as
  sessões do usuário são revogadas**. Sem `RESEND_API_KEY`, o link é impresso no
  log do servidor — é assim que se testa o fluxo em desenvolvimento.
- **Uploads**: validados por magic bytes (JPEG/PNG/WebP/SVG, máx. 10 MB), nome
  de arquivo gerado no servidor. Com `BLOB_READ_WRITE_TOKEN` definido vão para
  o Vercel Blob; sem ele, para `public/uploads/` (driver local de dev).

## Deploy na Vercel

1. Crie um banco PostgreSQL (aba **Storage** do projeto na Vercel — Neon /
   Prisma Postgres — ou qualquer provedor) e defina `DATABASE_URL` nas
   variáveis de ambiente do projeto.
2. Crie um **Blob store** (Storage → Blob); a Vercel injeta
   `BLOB_READ_WRITE_TOKEN` automaticamente.
3. Para os e-mails de recuperação de senha, defina `RESEND_API_KEY` e
   `MAIL_FROM` (remetente de um domínio verificado no Resend). Sem a chave o
   fluxo continua funcionando, mas o link só aparece no log — nunca chega ao
   usuário.
4. Importe o repositório na Vercel. O script `vercel-build` roda
   `prisma migrate deploy` antes do build, então as migrações são aplicadas a
   cada deploy (o `postinstall` já cuida do `prisma generate`).
5. Para popular o banco inicial (admin + categorias), rode localmente com o
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
