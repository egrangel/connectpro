---
name: Rede Connect UPP
description: A warm-paper directory for finding and contacting local professionals.
colors:
  primary: "#1A3D8A"
  accent: "#C8880A"
  surface: "#F8F6EF"
  text: "#0F1E40"
  panel: "color-mix(in srgb, var(--color-surface, #F8F6EF) 54%, white)"
  muted: "color-mix(in srgb, var(--color-text, #0F1E40) 62%, white)"
  line: "color-mix(in srgb, var(--color-text, #0F1E40) 19%, transparent)"
  action: "color-mix(in srgb, var(--color-primary, #1A3D8A) 73%, black)"
  action-hover: "color-mix(in srgb, var(--color-primary, #1A3D8A) 57%, black)"
  white: "#FFFFFF"
  admin-workspace: "#F1F5F9"
  admin-rail: "#172438"
  admin-current: "#30435D"
  admin-ink: "#0F172A"
  admin-nav: "#E2E8F0"
  admin-focus: "#557CAC"
typography:
  display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(2.5rem, 1.63rem + 3.5vw, 5.25rem)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-0.035em"
  headline:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(1.875rem, 1.35rem + 1.6vw, 3.125rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "1.625rem"
    fontWeight: 400
    lineHeight: 1.12
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 650
rounded:
  control: "10px"
  pill: "9999px"
  admin-control: "6px"
spacing:
  frame: "76rem"
  gutter: "clamp(1rem, 4vw, 3.5rem)"
  hero-inset: "clamp(1.5rem, 4vw, 4rem)"
  grid-gap: "1.375rem"
  admin-inset: "clamp(1.25rem, 4vw, 3.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.625rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.75rem"
  directory-search:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0.375rem"
  category-current:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
  listing-preview:
    textColor: "{colors.text}"
    typography: "{typography.title}"
  account-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
  admin-nav-current:
    backgroundColor: "{colors.admin-current}"
    textColor: "{colors.white}"
    rounded: "{rounded.admin-control}"
    padding: "0.6rem 0.7rem"
---

# Design System: Rede Connect UPP

## Overview

**Creative North Star — The local directory**

Warm paper, Georgia headlines and thin rules give the public directory an editorial rhythm. Search leads into a category index and listing previews. Each profile puts available ways to reach the professional near the top, including on phones.

Public branding comes from runtime settings. The administration workspace uses a fixed slate palette so its controls remain legible while staff edit the public theme.

## Colors

Navy anchors links and the hero media fallback. Primary buttons use a 73% primary mix with black at rest and 57% on hover. Gold marks focus, selection, ratings and the selected sort. The public focus outline mixes 64% accent with white.

Warm paper is the public canvas. The derived panel lightens it for account forms and selected categories. Controls and the header use white. Ink supplies body text and mixes into subdued text and hairlines. Slate supplies the admin canvas, rail, navigation and focus colors.

The four public colors and base radius in the tokens are the shipped defaults. The root layout injects the configured values and globals.css derives the supporting colors. The settings preview has its own scope for previewing changes.

## Typography

Georgia gives hero, profile and account headlines a regular-weight editorial face. Display titles balance their lines and use a compact line height. Listing names use a fixed 1.625rem Georgia scale. Geist handles descriptions, form labels, navigation and administration. Carousel controls and admin tables use tabular digits.

## Layout

The public frame caps at 76rem with fluid side gutters. The hero places copy before media and shifts to a 1:0.9 split at 48rem when an image exists. Search spans the frame above the index. Categories wrap on narrow screens and sit beside results at 48rem. The results grid uses 15.75rem as its preferred minimum column width.

On profiles, contact methods come before the description in the reading order and move to the right column at 48rem. Account panels use a narrow measure and increase their inset padding at 40rem.

The admin rail sits above content on narrow screens and becomes a 13.75rem left column at 54rem. The workspace uses a 75rem content cap and fluid padding.

## Elevation & Depth

The hero, results, contact and account surfaces use hairlines and changes in tone to establish boundaries. The account member card retains layered tinted shadows and its 420ms straightening transition. Reduced-motion preferences suppress visual transitions and smooth scrolling.

## Shapes

Inputs, primary actions and image thumbnails share the configured base radius. Hero media meets the straight edges of its frame. Category tags and sort options use pills. Desktop category links use square edges in a continuous ruled index. Admin rail links have 6px corners.

## Components

- **Primary action and text field** share a 44px minimum height. The action uses white text on darkened primary. The white field gains a primary border on focus. The public keyboard outline is 3px with a 3px offset.
- **Search** combines a labeled search input, icon and submit button in one white group. The category index exposes the current choice through weight, underline and a pale surface.
- **Listing preview** pairs a top rule with a Georgia title and an optional 4:3 image. The title underlines on hover. Ratings depend on review settings and recorded data.
- **Profile contact** presents each available channel as a link with an icon and label, grouped between horizontal rules.
- **Admin navigation** uses pale slate text on a dark rail, a lighter active surface and an underline for the current page.

## Do's and Don'ts

- Do use the configured colors and radius on public controls.
- Do keep search above categories and results, and contacts early in profile reading order.
- Do show rating data when reviews are enabled and data is available.
- Do use fixed slate colors in the admin workspace and scope public theme experiments to its settings preview.

## Default banner photography

The two bundled banner slides use original illustrative photography generated for this directory. The workshop scene accompanies discovery and the courtyard scene accompanies community. Each optimized WebP has a provenance sidecar with its full prompt. Stored references to earlier bundled banner artwork resolve to the new assets.
