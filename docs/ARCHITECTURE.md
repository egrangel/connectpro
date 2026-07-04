# Technical Plan — Professional Classifieds Platform ("Connect")

A public directory of professional listings with anonymous browsing, an
authenticated admin portal for listing management, optional user accounts for
reviews, and white-label visual customization.

> **Implementation status (2026-07-04):** Phases 0–4 of this plan are
> implemented in this repository as a working MVP. Deviations from the
> original plan and the remaining hardening work are tracked in
> [§17 Implementation Notes](#17-implementation-notes--deviations).

## 1. Recommended Architecture

**Modular monolith, server-rendered, single deployable.**

- **Next.js App Router (SSR)** serves the public site, the admin portal and
  server actions from one codebase.
- **Domain modules** (`src/modules/*`) own service logic, validation schemas
  and data access; route handlers/pages stay thin.
- **PostgreSQL** (production target) does relational data + full-text search;
  SQLite is used for local development (see §17).
- **Object storage + CDN** for images in production; local-disk driver in dev.

```
Next.js app ──► Public site (/)  Admin portal (/admin)  Server actions
      │
      ├──► Prisma ──► PostgreSQL (prod) / SQLite (dev)
      └──► Media storage: S3/R2 + CDN (prod) / public/uploads (dev)
```

## 2. Main Modules

| Module | Responsibilities |
|---|---|
| `modules/listings` | CRUD, draft/publish/archive lifecycle, search, aggregate rating cache |
| `modules/categories` | Category CRUD, ordered active list for filters |
| `modules/reviews` | 1–5 star reviews, one-per-user rule, transactional aggregate recompute, moderation |
| `modules/auth` | Registration (always USER), login, sessions, rate-limited actions |
| `modules/media` | Image validation by magic bytes, storage driver |
| `modules/settings` | Banner/theme/branding singleton, Zod-validated, cached read path |
| `lib/auth` | Password hashing (bcrypt cost 12), DB sessions, `requireAdmin` gate |

## 3. Roles and Permissions

| Capability | Anonymous | USER | ADMIN |
|---|---|---|---|
| Browse / search / view listings | ✅ | ✅ | ✅ |
| Create account | — | ✅ | ✅ |
| Post/edit/delete own review | — | ✅ | ✅ |
| Manage listings/categories | — | ❌ | ✅ |
| Moderate reviews | — | ❌ | ✅ |
| Banner/theme/branding | — | ❌ | ✅ |

**Invariant:** registration always creates `USER`; role is never part of any
user-facing input schema. The first admin comes from the seed script
(`SEED_ADMIN_*` env vars); further admins are promoted by an existing admin.

## 4. Database Model

See `prisma/schema.prisma`. Tables: `User`, `Session`, `Category`, `Listing`
(with denormalized `ratingAvg`/`ratingCount` and normalized `searchText`),
`ListingPhoto`, `Review` (unique `(listingId, userId)`), `SiteSettings`
(singleton row, JSON-as-validated-string per section).

Key indexes: `(status, categoryId, createdAt)` for the feed,
`(status, ratingAvg)` for rating sort, `(listingId, status, createdAt)` for
review lists.

## 5. API Surface

The MVP uses **server actions** (mutations) + **server-rendered pages**
(reads) instead of a standalone REST layer — same trust boundaries, less
surface. Every admin action re-checks `requireAdmin()`; every user action
re-checks session + ownership. A public REST façade (`/api/listings`, etc.)
can be added later over the same services if external consumers appear.

## 6. Frontend Structure (Public)

- `/` — hero banner (configurable), search bar, category chips, sort toggles,
  responsive card grid, pagination. **All filter state lives in the URL.**
- `/p/[slug]` — photo carousel, description, contact block
  (WhatsApp/phone/email/site), rating summary with distribution bars, review
  list, review form (or login prompt).
- `/login`, `/register` — optional accounts; browsing never requires login.

## 7. Admin Portal (`/admin`)

Guarded by `requireAdmin()` in the layout **and** in every server action.
Deliberately not themed by site settings (a broken theme must not break the
tool that fixes it). Sections: dashboard, listings (CRUD + photos + archive),
categories, review moderation (hide/restore), appearance (banner/theme/brand).

## 8. AuthN/AuthZ

- **DB sessions** (30 days) with HttpOnly/Secure/SameSite=Lax cookie —
  instant revocation beats stateless JWT for this shape of app.
- bcrypt cost 12; generic login errors; rate-limited login/register.
- Authorization enforced server-side at the action/service level; UI checks
  are convenience only.

## 9. Search & Filtering

- Write-time normalized `searchText` (lowercase + unaccented title,
  description, city) queried with `contains` — portable across SQLite and
  Postgres.
- Category = indexed equality on slug; sort = recent | rating (avg desc,
  count as tiebreaker).
- **Upgrade path:** swap the internals of
  `searchPublishedListings` for Postgres `tsvector` + `pg_trgm` (or
  Meilisearch beyond ~100k listings) without touching callers.

## 10. Images

Local driver (`modules/media/storage.ts`): magic-byte validation
(JPEG/PNG/WebP), ≤10 MB, ≤10 photos/listing, server-generated UUID filenames,
EXIF-free delivery paths under `/uploads/`. Production swaps the driver for
S3/R2 presigned uploads + CDN + `sharp` variants behind the same interface.

## 11. Ratings & Reviews

Integer 1–5 (validated + range-checked in service), optional ≤2000-char
plain-text comment, login required, **one review per user per listing (DB
unique constraint)**, edit = upsert, aggregates recomputed fully inside the
same transaction as every review write (create/update/delete/hide), admin
moderation via HIDDEN status (excluded from lists and averages, kept for
audit), per-user rate limit on submissions.

## 12. Customization

Fixed **design tokens**, not free CSS: 4 hex colors (regex-validated — the
CSS-injection guard) + radius scale, injected as CSS variables on `<html>` at
render time; banner (enabled/image/headline/CTA); branding (site name, logo,
footer). Saved via a Zod-validated singleton; `revalidatePath` refreshes the
whole site immediately.

## 13. Security Considerations

- Privilege escalation: role never in input schemas; admin promoted only via seed/admin.
- XSS: all user content rendered as escaped text; no `dangerouslySetInnerHTML`; theme values regex-constrained.
- SQLi: Prisma parameterized queries only.
- CSRF: SameSite=Lax + Next server-action origin checks.
- Credentials: bcrypt(12), generic errors, rate limits (in-memory → Redis at scale).
- Sessions: HttpOnly/Secure cookies, DB-backed revocation, expiry check + `isActive` check on every request.
- Uploads: magic bytes, size caps, server-generated names, no user paths.
- Prod checklist still open: CSP + security headers, HSTS, structured audit logging, dependency audit in CI.

## 14. Technology Stack

Next.js 16 (App Router, TS, Turbopack) · Tailwind CSS 4 · Prisma 6 ·
SQLite (dev) / PostgreSQL 16 (prod) · Zod 4 · bcryptjs · Vitest ·
target hosting: Vercel or Docker on VPS/Fly.io; R2/S3 + CDN for media.

## 15. Development Phases

- **Phase 0 — Foundation** ✅ scaffold, schema, migrations, seed, env, tests
- **Phase 1 — Admin core** ✅ auth/sessions/roles, categories, listings CRUD, photo uploads
- **Phase 2 — Public site** ✅ home feed, search/filters/sort, detail page, SEO metadata
- **Phase 3 — Accounts & reviews** ✅ register/login, review CRUD, aggregates, moderation, rate limits
- **Phase 4 — Customization** ✅ theme tokens, banner, branding, live revalidation
- **Phase 5 — Hardening & launch** ⏳ security headers/CSP, E2E suite (Playwright), accessibility & CWV pass, Postgres + object storage migration, backups/monitoring, deploy runbook

## 16. Risks, Trade-offs, Scalability

- Monolith over microservices; module seams keep the exit door open.
- Substring search over search engine — fine to ~10⁴–10⁵ listings; `SearchService` seam planned for FTS/Meilisearch.
- Sessions over JWT — revocation and simplicity.
- Token theming over custom CSS — kills an XSS class.
- Denormalized aggregates — transactional full recompute avoids drift.
- Scale path: CDN/ISR caching → read replica → Redis cache → search engine → media worker queue.

## 17. Implementation Notes / Deviations

Decisions made during Phase 0–4 execution that differ from the original plan,
with reasons:

1. **SQLite instead of Dockerized Postgres for dev** — the dev machine has no
   Docker. Schema avoids provider-specific features (string unions instead of
   enums, JSON-as-string in `SiteSettings`, `Float` rating). Migration path in
   README.
2. **Server actions instead of a REST API layer** — fewer moving parts for an
   SSR app; services are the stable seam if a REST façade is needed later.
3. **Hand-rolled DB sessions instead of Auth.js** — Auth.js v5 Credentials
   provider pushes toward JWT sessions; direct sessions are simpler and meet
   the revocation requirement (~100 lines in `lib/auth/session.ts`).
4. **Prisma 6 (not 7) pinned** — Prisma 7 refuses Node 21 (installed on the
   dev machine). Revisit after a Node LTS upgrade.
5. **Offset pagination with page links instead of cursor + infinite scroll** —
   SSR-friendly, shareable URLs; cursor pagination is a drop-in change inside
   the listings service if depth becomes a problem.
6. **Plain `<img>` instead of `next/image`** — local uploads have no stored
   dimensions yet; cards/carousel use fixed aspect-ratio boxes to avoid CLS.
   Move to `next/image` + variants when the S3/sharp pipeline lands.
