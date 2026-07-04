import { prisma } from "@/lib/prisma";
import {
  bannerSchema,
  brandingSchema,
  themeSchema,
  DEFAULT_BANNER,
  DEFAULT_BRANDING,
  DEFAULT_THEME,
  type BannerConfig,
  type BrandingConfig,
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
    };
  }
  return {
    banner: parseOrDefault(row.bannerJson, bannerSchema, DEFAULT_BANNER),
    theme: parseOrDefault(row.themeJson, themeSchema, DEFAULT_THEME),
    branding: parseOrDefault(row.brandingJson, brandingSchema, DEFAULT_BRANDING),
  };
}

export async function updateSiteConfig(config: {
  banner: BannerConfig;
  theme: ThemeConfig;
  branding: BrandingConfig;
}): Promise<void> {
  const data = {
    bannerJson: JSON.stringify(bannerSchema.parse(config.banner)),
    themeJson: JSON.stringify(themeSchema.parse(config.theme)),
    brandingJson: JSON.stringify(brandingSchema.parse(config.branding)),
  };
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
}
