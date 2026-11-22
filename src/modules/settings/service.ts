import { prisma } from "@/lib/prisma";
import {
  bannerSchema,
  brandingSchema,
  featuresSchema,
  termsSchema,
  themeSchema,
  DEFAULT_BANNER,
  DEFAULT_BRANDING,
  DEFAULT_FEATURES,
  DEFAULT_TERMS,
  DEFAULT_THEME,
  type BannerConfig,
  type BrandingConfig,
  type FeaturesConfig,
  type SiteConfig,
  type TermsConfig,
  type ThemeConfig,
} from "./schema";
import type { ZodType } from "zod";

function parseOrDefault<T>(json: string, schema: ZodType<T>, fallback: T): T {
  try {
    const result = schema.safeParse(JSON.parse(json));
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

// Existing settings can still point to previous built-in artwork.
const bundledBannerReplacements = new Map([
  ["/branding/slide-1.svg", "/branding/banner-oficina.webp"],
  ["/branding/hero-rede-1.webp", "/branding/banner-oficina.webp"],
  ["/branding/slide-2.svg", "/branding/banner-comunidade.webp"],
  ["/branding/hero-rede-2.webp", "/branding/banner-comunidade.webp"],
]);

function getConfiguredBanner(json: string): BannerConfig {
  const banner = parseOrDefault(json, bannerSchema, DEFAULT_BANNER);
  return {
    ...banner,
    slides: banner.slides.map((slide) => {
      const replacement = slide.imageKey ? bundledBannerReplacements.get(slide.imageKey) : undefined;
      if (!replacement) return slide;

      return {
        ...slide,
        imageKey: replacement,
        subheadline: slide.subheadline === "Profissionais verificados e avaliados pela comunidade — contrate com confiança."
          ? "Cada anúncio é revisado antes de ir ao ar. Encontre um profissional e fale direto com ele."
          : slide.subheadline,
      };
    }),
  };
}

/** Reads the singleton settings row, falling back to defaults per section. */
export async function getSiteConfig(): Promise<SiteConfig> {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) {
    return {
      banner: DEFAULT_BANNER,
      theme: DEFAULT_THEME,
      branding: DEFAULT_BRANDING,
      features: DEFAULT_FEATURES,
      terms: DEFAULT_TERMS,
    };
  }
  return {
    banner: getConfiguredBanner(row.bannerJson),
    theme: parseOrDefault(row.themeJson, themeSchema, DEFAULT_THEME),
    branding: parseOrDefault(row.brandingJson, brandingSchema, DEFAULT_BRANDING),
    features: parseOrDefault(row.featuresJson, featuresSchema, DEFAULT_FEATURES),
    terms: parseOrDefault(row.termsJson, termsSchema, DEFAULT_TERMS),
  };
}

/**
 * The consent agreement alone — the registration page needs nothing else, and
 * rows written before this section existed hold `{}`, which falls back to the
 * default text rather than showing an empty agreement.
 */
export async function getConsentTerms(): Promise<TermsConfig> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: { termsJson: true },
  });
  if (!row) return DEFAULT_TERMS;
  return parseOrDefault(row.termsJson, termsSchema, DEFAULT_TERMS);
}

/** Feature flags only — cheaper than getSiteConfig for pages that just gate UI. */
export async function getSiteFeatures(): Promise<FeaturesConfig> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: { featuresJson: true },
  });
  if (!row) return DEFAULT_FEATURES;
  return parseOrDefault(row.featuresJson, featuresSchema, DEFAULT_FEATURES);
}

export async function updateSiteConfig(config: {
  banner: BannerConfig;
  theme: ThemeConfig;
  branding: BrandingConfig;
  features: FeaturesConfig;
  terms: TermsConfig;
}): Promise<void> {
  const data = {
    bannerJson: JSON.stringify(bannerSchema.parse(config.banner)),
    themeJson: JSON.stringify(themeSchema.parse(config.theme)),
    brandingJson: JSON.stringify(brandingSchema.parse(config.branding)),
    featuresJson: JSON.stringify(featuresSchema.parse(config.features)),
    termsJson: JSON.stringify(termsSchema.parse(config.terms)),
  };
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
}
