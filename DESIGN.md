---
name: Rede Connect UPP
description: White-label community directory of professionals; navy and gold by default, re-skinned at runtime from admin Configurações.
colors:
  primary: "#1A3D8A"
  accent: "#C8880A"
  surface: "#F4F7FF"
  text: "#0F1E40"
  panel: "#F9FBFF"
  muted: "#6A7389"
  line: "rgba(15, 30, 64, 0.10)"
  white: "#FFFFFF"
  star-empty: "#D7DBE0"
  error-bg: "#FEF2F2"
  error-text: "#B91C1C"
  success-bg: "#ECFDF5"
  success-text: "#047857"
  pending-bg: "#FFFBEB"
  pending-text: "#92400E"
  admin-ink: "#0F172A"
  admin-body: "#475569"
  admin-muted: "#64748B"
  admin-border: "#CBD5E1"
  admin-hairline: "#E2E8F0"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  section:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  body-sm:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
  caption:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  control: "10px"
  card-listing: "16px"
  card: "18px"
  media: "20px"
  member-card: "24px"
  pill: "9999px"
  admin-control: "6px"
  admin-panel: "8px"
spacing:
  gutter: "16px"
  stack: "16px"
  card: "20px"
  card-lg: "24px"
  grid-gap: "24px"
  section: "48px"
  container: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-hero-cta:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  chip-filter:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip-filter-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  listing-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.card-listing}"
    padding: "{spacing.card}"
  member-card:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.member-card}"
    padding: "32px"
  admin-button:
    backgroundColor: "{colors.admin-ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.admin-control}"
    padding: "10px 20px"
  admin-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.admin-ink}"
    rounded: "{rounded.admin-control}"
    padding: "8px 12px"
---

# Design System: Rede Connect UPP

## Overview

**Creative North Star: "The Network's Own Noticeboard"**

The public site is a calm, pale directory lit by one navy voice and a thread of gold: the palette of the Connect UPP emblem (navy globe, gold ring). Pages are white panels with soft, tinted shadows resting on a pale blue-white ground, set in Geist alone, with hierarchy carried by bold weight and tight tracking rather than a second face. Photography and the generated network artwork (warm points joined by gold lines on navy) appear under a primary tint, so imagery always speaks in the site's own colour.

The system is white-label by construction. Every public colour and the base corner radius are **runtime-configurable defaults**: admins set primary, accent, surface, text, radius (none / sm / md / lg / full), logo and site name in admin → Configurações, and the root layout injects them as CSS custom properties (`--color-primary`, `--color-accent`, `--color-surface`, `--color-text`, `--radius`) over the `:root` defaults in `globals.css` (mirrored by `DEFAULT_THEME` in `src/modules/settings/schema.ts`). Panel, muted text, hairlines and both shadows are derived from those four colours with `color-mix()`, so a re-branded site stays coherent without anyone touching code. The hex values in the frontmatter are the shipped defaults (derived tokens are their resolved approximations), not fixed brand law.

The admin portal (`src/app/admin/**`) is a separate, deliberately unthemed world: plain Tailwind slate on white, small radii, no tinted shadows. A broken theme must never break the tool used to fix it.

**Key Characteristics:**
- Four runtime theme colours plus a radius; everything else is mixed from them.
- One family (Geist), bold and tightly tracked for every heading.
- White panels with a soft card shadow on a pale gradient ground.
- Corners all derive from one `--radius` by fixed offsets.
- Primary actions lift 2px on hover; cards lift 4px.
- Gold marks rating, focus and selection; navy carries action.
- Admin is unthemed slate, on purpose.

## Colors

A single-navy, single-gold palette over a cool near-white, all re-colourable at runtime.

### Primary
- **Emblem Navy** (primary): every filled action (primary button, "Criar conta" in the header, active filter chip), links, input caret and focus border, the tint over hero and member-card artwork, and the footer wash (8% into white). Runtime-configurable.

### Secondary
- **Ring Gold** (accent): star fills, rating-distribution bars, the global focus outline (64% into white), text selection (32% into white), the active sort pill (18% into white), the right-hand tail of the hero gradient, and the ring of the member card's fallback emblem. Runtime-configurable.

### Neutral
- **Pale Field** (surface): the page ground, painted as a soft vertical gradient (82% into white at top, pure at 44%, 70% into white at the foot). Runtime-configurable.
- **Night Ink** (text): body and heading colour; also the base of muted text, hairlines and the card shadow. Runtime-configurable.
- **Panel White** (panel): card fill, `color-mix(surface 54%, white)`, then 92% into white inside `.card-surface`.
- **Slate Muted** (muted): secondary copy, counts, hints, `color-mix(text 62%, white)`.
- **Hairline** (line): every 1px border on the public site, text at 10% opacity.
- **Status tints** (error, success, pending): Tailwind red / emerald / amber 50 grounds with 700-800 text, used for alerts and listing-status badges. These are not themed.

### Admin
- **Slate ink, body, muted, border, hairline** (admin-*): the admin portal's entire palette, Tailwind slate 900 / 600 / 500 / 300 / 200 on white.

### Named Rules
**The Runtime Palette Rule.** Public surfaces reference only `var(--color-primary|accent|surface|text)`, the derived `--color-panel|muted|line`, white, or `color-mix()` of these. A literal brand hex on a public surface breaks re-branding.

**The Gold Signal Rule.** Accent marks rating, focus, selection and the current sort; it never fills a button. Action is always navy.

**The Unthemed Workshop Rule.** Admin pages use slate and never read theme variables (the settings preview, which uses its own `--preview-*` vars, is the one sanctioned exception).

## Typography

**Display Font:** Geist (with system-ui, sans-serif)
**Body Font:** Geist (with system-ui, sans-serif)
**Label/Mono Font:** Geist Mono is loaded but used only for the admin terms textarea.

**Character:** A single neutral grotesk does all the work; hierarchy comes from bold 700, tight tracking (-0.025em) and size, which keeps the white-label site legible under any palette.

### Hierarchy
- **Display** (700, 2.25rem rising to 3.75rem at sm, 1.04): hero carousel headlines only, white on tinted artwork, `text-balance`, max ~48rem.
- **Headline** (700, 2.25rem rising to 2.75rem, 1.05): page titles such as the register page; listing pages use 1.875rem to 2.25rem.
- **Section** (700, 1.5rem rising to 1.875rem): section heads ("Encontre quem resolve", "Avaliações").
- **Title** (700, 1.125rem, 1.375): card and panel titles; listing-card titles turn primary on hover.
- **Body** (400, 1rem, 1.75): lead and description copy in muted, max ~28rem to 42rem; long descriptions use 2.0 line height.
- **Body small** (400, 0.875rem, 1.5): the workhorse size for card copy, hints, metadata.
- **Label** (700, 0.875rem): form labels and button text; the label wraps its input.
- **Caption** (600, 0.75rem): chips, badges, footer fine print, password hints.

### Named Rules
**The One Family Rule.** Geist only on the public site. No display face, no serif; emphasis is weight and tracking.

## Layout

A single centred column of `max-w-6xl` (72rem) with 16px side gutters; listing detail narrows to `max-w-5xl`. Sections breathe at 48px to 56px vertical padding; the footer sits 80px below content. The listing grid is 1 / 2 / 3 columns (base / sm 640px / lg 1024px) with 24px gaps. The listing detail is description plus a 320px contact column from md (768px); contact moves first on phones because reaching the professional is the point. The register page is a two-column grid at lg (form up to 34rem, 64px gap) with the member card sticky at 112px from the top; phones get a compact card above the form. The header is sticky, translucent (surface 84% into white at 90% opacity) with backdrop blur, at least 72px tall. Filter chips scroll sideways on phones and wrap from sm. Body has a 320px minimum width.

## Elevation & Depth

Layered and soft. Panels float on the pale ground with one ambient, colour-tinted shadow; hover and hero moments get a larger, primary-tinted one. Shadows are mixed from the theme's text or primary colour so they re-tint with the brand, except over photography where a neutral black shadow is used.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 10px 30px color-mix(in srgb, var(--color-text) 9%, transparent)`): every `.card-surface` panel at rest.
- **Soft** (`box-shadow: 0 18px 55px color-mix(in srgb, var(--color-primary) 13%, transparent)`): listing card on hover, photo carousel frame.
- **Action glow** (`box-shadow: 0 14px 30px color-mix(in srgb, var(--color-primary) 22%, transparent)`): primary buttons (12px/28px/24% on search, 10px/24px/22% in the header).
- **Header** (`box-shadow: 0 8px 28px color-mix(in srgb, var(--color-text) 6%, transparent)`): sticky header only.
- **Member card** (`0 28px 60px text 28%, 0 6px 16px text 14%`; active `0 36px 70px text 32%, 0 8px 20px text 16%`): the register card, the deepest object on the site.
- **Over imagery** (`box-shadow: 0 18px 40px rgba(0,0,0,.22)`): the white hero CTA.

### Named Rules
**The Tinted Shadow Rule.** Shadows are diffuse and colour-mixed from the theme; no hard offsets, no neutral grey except over photographs.

## Shapes

Every corner derives from the runtime `--radius` (default 10px; admin options 0 / 4 / 10 / 18 / 9999px) by fixed offsets: controls, inputs, contact rows and thumbnails at `--radius`; listing cards at +6px; content panels and the filter bar at +8px; the photo carousel and login card at +10px; the full member card at +14px (compact +8px). Chips, badges, carousel dots and hero controls are full pills. Borders are 1px hairlines; the filled emblem fallback in the header is a radius square, the member-card fallback a gold-ringed circle. Imagery is always clipped to its container's radius.

**The Radius Offset Rule.** Never hard-code a public radius; use `var(--radius)` or `calc(var(--radius) + n)` so the admin's choice reaches every corner.

## Components

### Buttons
Confident and lifted.
- **Shape:** gently curved (`--radius`, 10px default).
- **Primary:** navy fill, white bold text, 12px by 20px (header 8px by 16px; search 48px tall), action glow shadow.
- **Hover / Focus:** lifts 2px and dims to 95% opacity; focus is the global 3px gold outline offset 3px. Pending state dims to 70% with a wait cursor and no lift.
- **Secondary:** white at 70-80% with hairline border, bold text (navy for links out, ink for "Sair"/pagination), hover to solid white.
- **Ghost nav:** no fill, hover to white at 70% (admin link: primary 10% into white).
- **Hero CTA:** white fill, navy text, black-tinted shadow, hover lifts 2px and warms toward gold (12% accent into white).

### Chips
- **Filter chips:** full pill, 8px by 16px, semibold small. Unselected: white at 70%, hairline, muted text, hover white and ink. Selected: navy fill, white text, small shadow.
- **Sort pills:** borderless pills; current is gold 18% into white with ink text.
- **Badges:** category badge on photos is white 92% with navy bold caption; city badge is black 44% with blur; listing-page category badge is primary 12% into white.

### Cards / Containers
- **Corner Style:** `--radius` + 8px (listing cards +6px).
- **Background:** panel 92% into white.
- **Shadow Strategy:** Card shadow at rest; listing cards swap to Soft and lift 4px on hover, photo zooms to 1.04 over 500ms.
- **Border:** 1px hairline.
- **Internal Padding:** 20px, 24px from sm; empty states 48px and centred.

### Inputs / Fields
- **Style:** 1px hairline, white at 86%, `--radius`, 10px by 12px; label is bold small text wrapping the field with 6px gap; navy caret.
- **Focus:** border turns navy plus a 4px navy ring at 16% (18% on search).
- **Error:** register uses a red-50 alert panel with red-200 border and red-700 text at `--radius`; checkboxes use navy `accent-color`.

### Navigation
Sticky translucent header: logo (44px tall) plus site name in semibold 18px (name hidden visually on phones when a logo exists), right-side small semibold links in ghost style, primary "Criar conta". Breadcrumbs are small semibold muted links turning navy on hover. Footer is a primary-tinted band with the site name in bold, muted copy and pill-shaped outbound links.

### Hero Carousel
Full-bleed navy band, 480px (540px from sm), artwork cross-fading over 700ms under a 110deg gradient (primary 80% to 55% to accent 40%) and a top/bottom black veil. Copy fades over 500ms. Controls sit in one row under the copy: 36px translucent black pills with inline SVG chevrons and pill dots (active stretches to 24px). Autoplay every 5.5s pauses on hover or focus and never runs under reduced motion.

### Member Card (signature)
The account preview on the register page. Hero network artwork under a primary `mix-blend-color` wash at 60% and a 115deg primary gradient (72% to 38%), so the art takes any theme's hue. Top left: emblem (40px) and site name, semibold. Bottom: the visitor's name in white bold 2.15rem, echoing the Nome field live (placeholder "Seu nome" at 75% opacity), with two small facts below. At rest it is tilted -2deg; while the name field has focus it straightens to 0deg and rises 4px over 420ms `cubic-bezier(0.16, 1, 0.3, 1)`, deepening its shadow, and settles back on blur. No transition under `prefers-reduced-motion`. Aspect 13:8 (compact 16:7, untilted, above the form on phones). Decorative and `aria-hidden`.

### Rating
Five inline SVG stars, 16px (20px large), gold fill, empty stars #D7DBE0. Distribution bars are 10px pills, gold on text 10% into white.

### Admin Panels
Slate world: 6px controls with slate-300 borders and a slate-200 2px focus ring, slate-900 buttons hovering to slate-700, 8px white fieldsets with slate-200 borders, slate-600 nav links hovering on slate-200 at 60%.

## Do's and Don'ts

### Do:
- **Do** reference theme colours through `var(--color-*)` and `color-mix()` on every public surface; the frontmatter hexes are defaults an admin can replace.
- **Do** derive every public corner from `var(--radius)` with the established offsets (+6, +8, +10, +14, pill).
- **Do** wrap content panels in the card surface: hairline border, panel fill, Card shadow, `--radius` + 8px.
- **Do** tint imagery and artwork with primary so it holds under any theme, as the hero and member card do.
- **Do** give primary actions the navy fill, action glow and 2px hover lift.
- **Do** honour `prefers-reduced-motion` for every transition and autoplay.
- **Do** use inline SVG for icons, coloured with `currentColor` or theme vars.
- **Do** keep admin on the slate palette and 6px / 8px radii.

### Don't:
- **Don't** write literal brand hex or slate utilities into public or member-area components; that silently breaks re-branding.
- **Don't** fill buttons with the gold accent; gold is for rating, focus, selection and current state.
- **Don't** add a second typeface to the public site.
- **Don't** use hard offset or neutral grey shadows on public surfaces outside photographs.
- **Don't** read theme variables in admin pages.
