import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use #RRGGBB)");

export const bannerSchema = z.object({
  enabled: z.boolean(),
  imageKey: z.string().nullable(),
  headline: z.string().trim().max(120),
  subheadline: z.string().trim().max(200),
  ctaText: z.string().trim().max(40),
  ctaUrl: z.string().trim().max(500),
});
export type BannerConfig = z.infer<typeof bannerSchema>;

export const themeSchema = z.object({
  primary: hexColor,
  accent: hexColor,
  surface: hexColor,
  text: hexColor,
  radius: z.enum(["none", "sm", "md", "lg", "full"]),
});
export type ThemeConfig = z.infer<typeof themeSchema>;

export const brandingSchema = z.object({
  siteName: z.string().trim().min(1, "Informe o nome do site").max(60),
  logoKey: z.string().nullable(),
  footerText: z.string().trim().max(300),
});
export type BrandingConfig = z.infer<typeof brandingSchema>;

export const DEFAULT_BANNER: BannerConfig = {
  enabled: true,
  imageKey: null,
  headline: "Encontre o profissional certo para o seu projeto",
  subheadline:
    "Eletricistas, professores, desenvolvedores e muito mais — avaliados por quem já contratou.",
  ctaText: "Explorar profissionais",
  ctaUrl: "#listagens",
};

export const DEFAULT_THEME: ThemeConfig = {
  primary: "#0f766e",
  accent: "#f59e0b",
  surface: "#f8fafc",
  text: "#0f172a",
  radius: "md",
};

export const DEFAULT_BRANDING: BrandingConfig = {
  siteName: "Connect Profissionais",
  logoKey: null,
  footerText: "Conectando você aos melhores profissionais da sua região.",
};

export interface SiteConfig {
  banner: BannerConfig;
  theme: ThemeConfig;
  branding: BrandingConfig;
}

export const RADIUS_CSS: Record<ThemeConfig["radius"], string> = {
  none: "0px",
  sm: "4px",
  md: "10px",
  lg: "18px",
  full: "9999px",
};
