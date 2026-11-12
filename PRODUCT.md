# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitors:** mostly the congregation of the 1ª Igreja Presbiteriana Renovada (IPR) de Maringá-PR and the people around it. They come to find a professional or service and pick someone from inside the community. They can browse and search without an account. They need an account only to leave a review.
- **Advertisers (authors):** church and network members who offer a service (electrician, teacher, cleaner, photographer, developer and so on). Any logged-in user can create a listing, but it is saved as a draft and an admin publishes it.
- **Admins:** the people who run the portal for the network. They approve, edit and archive listings, manage categories, moderate reviews, read search reports and edit the site's banner, theme, branding, feature toggles and consent text.

## Product Purpose

A public directory of professionals and services from the Rede Connect UPP community. Its job is to make it easy to find and contact a trusted provider from within the network. Success is a visitor reaching a provider's WhatsApp, phone, email, site or Instagram from a listing, and the community choosing each other's services first.

## Positioning

A small, local, curated directory instead of an open marketplace. Every listing is reviewed and published by an admin before it goes live, and authors' edits to a live listing send it back for review. Reviews (1–5 stars) come from logged-in community members. What sets it apart from Google or OLX is curation plus belonging to the same community, with curation as the leading claim.

## Operating Context

- Portuguese (pt-BR) only. Users are in Maringá-PR and the surrounding region.
- Contact happens off-platform, mainly through WhatsApp. The portal does not handle hiring, quotes or payments.
- The public site is white-label at runtime: admins set the banner slides, theme colours, logo, site name and footer text in admin → Configurações. The admin portal is deliberately not themed, so a broken theme can't break the tool that fixes it.
- Admins can turn reviews off site-wide (`features.reviewsEnabled`). Public surfaces must work with and without ratings.

## Capabilities and Constraints

- Public: home with configurable hero slides, search, category chips, sort options and a paginated card grid, with all filter state in the URL. Listing page (`/p/[slug]`) with photo carousel, description, contact block, rating summary with distribution, reviews and the review form.
- Accounts: register (always role USER, with a mandatory consent agreement), login, password reset by email.
- Author portal (`/my-listings`): create and edit own listings as drafts, upload photos (limit configurable, 1–20, default 10; 4:3 source recommended, cropped 4:3 on cards and 16:9 on the listing page).
- Admin (`/admin`): dashboard, listings, categories, review moderation, reports (most-searched terms) and settings.
- Listing statuses: DRAFT, PUBLISHED, ARCHIVED. Only admins publish.
- Stack: Next.js 16 App Router, Tailwind CSS 4, Prisma on Neon Postgres, Vercel Blob for photos, Resend for email, deployed on Vercel.

## Brand Commitments

- **Official name: Rede Connect UPP** ("Unidos Por um Propósito"). The consent text still says "Grupo Connect Pro" and should be aligned to Rede Connect UPP. "connectpro" is only the technical project name.
- The site belongs to and is credited to the 1ª Igreja Presbiteriana Renovada (IPR) de Maringá-PR, with links to iprmaringa.com.br and the Instagram @rede.connectupp.
- Logos: `public/branding/connect-upp-logo.png` (network emblem: globe, flame and "R" mark) and `public/branding/ipr-maringa-emblem.png` (church emblem).

## Evidence on Hand

- Production has no real listings, reviews or users yet. The database was recreated empty on 2026-11-12, and the seed listings (Carlos Andrade, Marina Lopes and others) are demo content. Do not present them as real providers.
- No testimonials, provider counts, ratings or "verified" claims exist. Do not invent them. The default banner line "Profissionais verificados e avaliados pela comunidade" goes beyond what the product does: admins approve listings, they don't verify credentials.

## Product Principles

1. **Curation is the product.** Publishing is an admin decision, and every surface should make "reviewed before it goes live" clear without overstating it as verification.
2. **Community first, always open to browse.** Finding and contacting someone never requires an account, and nothing should feel members-only to a visitor.
3. **Get people to the contact.** Each listing exists to lead to a WhatsApp, a call or a message. Contact options stay visible and one tap away on a phone.
4. **The admin's settings shape the public site.** Public surfaces have to hold up under any theme, logo or banner an admin chooses, with or without reviews and photos.
5. **Say only what is true.** No made-up social proof, counts or claims. Empty states should be honest about a young directory.
