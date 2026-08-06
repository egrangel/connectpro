import { prisma } from "@/lib/prisma";
import {
  bannerSchema,
  brandingSchema,
  featuresSchema,
  themeSchema,
  DEFAULT_BANNER,
  DEFAULT_BRANDING,
  DEFAULT_FEATURES,
  DEFAULT_THEME,
  type BannerConfig,
  type BrandingConfig,
  type FeaturesConfig,
  type SiteConfig,
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

/** Reads the singleton settings row, falling back to defaults per section. */
export async function getSiteConfig(): Promise<SiteConfig> {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!row) {
    return {
      banner: DEFAULT_BANNER,
      theme: DEFAULT_THEME,
      branding: DEFAULT_BRANDING,
      features: DEFAULT_FEATURES,
    };
  }
  return {
    banner: parseOrDefault(row.bannerJson, bannerSchema, DEFAULT_BANNER),
    theme: parseOrDefault(row.themeJson, themeSchema, DEFAULT_THEME),
    branding: parseOrDefault(row.brandingJson, brandingSchema, DEFAULT_BRANDING),
    features: parseOrDefault(row.featuresJson, featuresSchema, DEFAULT_FEATURES),
  };
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
}): Promise<void> {
  const data = {
    bannerJson: JSON.stringify(bannerSchema.parse(config.banner)),
    themeJson: JSON.stringify(themeSchema.parse(config.theme)),
    brandingJson: JSON.stringify(brandingSchema.parse(config.branding)),
    featuresJson: JSON.stringify(featuresSchema.parse(config.features)),
  };
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
}
