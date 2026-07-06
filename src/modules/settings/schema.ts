import { z } from "zod";
import { isSafePublicHref } from "@/lib/url";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use #RRGGBB)");

export const slideSchema = z.object({
  imageKey: z.string().nullable(),
  headline: z.string().trim().max(120),
  subheadline: z.string().trim().max(200),
  ctaText: z.string().trim().max(40),
  ctaUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || isSafePublicHref(v), "URL inválida"),
});
export type SlideConfig = z.infer<typeof slideSchema>;

export const bannerSchema = z.object({
  enabled: z.boolean(),
  slides: z.array(slideSchema).min(1).max(5),
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
  slides: [
    {
      imageKey: "/branding/slide-1.svg",
      headline: "Encontre o profissional certo para o seu projeto",
      subheadline:
        "Eletricistas, professores, desenvolvedores e muito mais - avaliados por quem já contratou.",
      ctaText: "Explorar profissionais",
      ctaUrl: "#listagens",
    },
    {
      imageKey: "/branding/slide-2.svg",
      headline: "Unidos Por um Propósito",
      subheadline:
        "Profissionais verificados e avaliados pela comunidade — contrate com confiança.",
      ctaText: "Ver profissionais",
      ctaUrl: "#listagens",
    },
  ],
};

// Paleta extraída do emblema Connect UPP: anel dourado, globo azul-marinho,
// anel interno ciano e chama laranja-vermelha.
export const DEFAULT_THEME: ThemeConfig = {
  primary: "#1A3D8A",
  accent: "#C8880A",
  surface: "#F4F7FF",
  text: "#0F1E40",
  radius: "md",
};

export const DEFAULT_BRANDING: BrandingConfig = {
  siteName: "Rede Connect UPP",
  logoKey: "/branding/connect-upp-logo.png",
  footerText:
    "Uma iniciativa da Rede Connect UPP para conectar você aos melhores profissionais da sua região.",
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
