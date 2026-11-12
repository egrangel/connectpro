---
version: 1
slug: "src-app-register-page-tsx"
primary_target: "src/app/register/page.tsx"
related_targets: []
---

# Register page (/register)

Mode: Operate. One-page account creation for Rede Connect UPP. Visitors arrive about equally to review someone they hired and to advertise their own service. Browsing never needs an account. After submit, behaviour stays as it is today.

Constraints: one page, no wizard; must not feel like a tech startup; the full consent text stays readable where it is accepted and is still enforced server-side; theme, logo and site name come from admin settings at runtime; the "Avaliar" use disappears when reviews are switched off; no claim of membership, verification or vetting.

## Direction contract

THESIS: Creating an account reads as joining the network: the name you type appears on a Rede Connect UPP card beside the form. Refuses the default lone centred form card on an empty ground.

OWN-WORLD: The site's own system: Geist, theme tokens (primary navy, gold accent, pale surface), white panels with the soft card shadow. The card carries the hero network artwork under a primary tint, with the gold-ringed emblem, the site name and a large white name line.

STORY: The visitor sees in one glance that browsing needs no account, that an account is for reviewing and advertising, and that listings are reviewed before going live. They fill three fields, read and accept the agreement, and create the account.

FIRST VIEWPORT: Desktop: two columns inside the site width. Left about 45%: "Criar a sua conta", one line on what the account is for, then Nome, E-mail, Senha (with its 8-character hint), the scrollable agreement, the accept box and the primary "Criar conta" button. Right: the card tilted about 2 degrees, then two plain blocks, Avaliar and Anunciar. Phone: a compact card above the form, form first in reading order for assistive tech.

FORM: Cartão da rede, position 4 on my ordered list of seven (dealt structure). seed:d53c729e545bd6d8
Signature interaction: the name echoes live onto the card; while the name field has focus the card straightens to 0 degrees and settles back on blur. No motion under prefers-reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
