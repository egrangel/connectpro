import { z } from "zod";
import {
  DEFAULT_MAX_PHOTOS_PER_LISTING,
  PHOTOS_PER_LISTING_MAX,
  PHOTOS_PER_LISTING_MIN,
  TERMS_TEXT_MAX_LENGTH,
} from "@/lib/constants";
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

export const featuresSchema = z.object({
  reviewsEnabled: z.boolean(),
  // `.default()` is load-bearing: rows written before this field existed must
  // still parse. Without it the whole features section would fall back to
  // defaults on read, silently re-enabling reviews an admin had turned off.
  maxPhotosPerListing: z.coerce
    .number()
    .int()
    .min(PHOTOS_PER_LISTING_MIN, `Mínimo de ${PHOTOS_PER_LISTING_MIN} foto por anúncio`)
    .max(PHOTOS_PER_LISTING_MAX, `Máximo de ${PHOTOS_PER_LISTING_MAX} fotos por anúncio`)
    .default(DEFAULT_MAX_PHOTOS_PER_LISTING),
});
export type FeaturesConfig = z.infer<typeof featuresSchema>;

// The consent agreement a visitor must accept to register. Never empty: an
// admin who blanks the field would otherwise leave the registration form asking
// people to agree to nothing, and the acceptance we record would mean nothing.
export const termsSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Informe o texto do termo de consentimento")
    .max(TERMS_TEXT_MAX_LENGTH, "Texto do termo muito longo"),
});
export type TermsConfig = z.infer<typeof termsSchema>;

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

export const DEFAULT_FEATURES: FeaturesConfig = {
  reviewsEnabled: true,
  maxPhotosPerListing: DEFAULT_MAX_PHOTOS_PER_LISTING,
};

// Starting text, meant to be reviewed and adjusted by whoever runs the portal —
// it is editable in admin → Configurações precisely because this is a legal
// statement, not a product string.
export const DEFAULT_TERMS: TermsConfig = {
  text: `Ao criar uma conta no portal do Grupo Connect Pro, você declara que leu, entendeu e concorda com os termos abaixo.

1. Uso dos seus dados
Você autoriza o Grupo Connect Pro a coletar, armazenar e utilizar os dados que informar — nome, e-mail, telefone, WhatsApp, redes sociais, cidade, textos e imagens enviadas — para criar e manter sua conta, publicar os anúncios que você cadastrar e permitir que outras pessoas entrem em contato com você.

2. Contato e divulgação
Os dados de contato incluídos em um anúncio ficam visíveis publicamente no portal, para qualquer visitante, com ou sem cadastro. Você também autoriza o uso das imagens que enviar na divulgação do portal e dos seus próprios anúncios, sem qualquer remuneração.

3. Conteúdo enviado por você
Você é responsável pelo conteúdo que publica e declara ter os direitos necessários sobre os textos e as imagens enviadas, incluindo a autorização das pessoas retratadas.

4. Limitação de responsabilidade
O Grupo Connect Pro apenas disponibiliza o espaço de divulgação. O Grupo Connect Pro NÃO se responsabiliza por nenhum serviço, produto, negociação, pagamento, orçamento, prazo ou qualquer outra coisa oferecida, prometida ou prestada por qualquer anunciante do portal. A contratação acontece diretamente entre você e o anunciante, por sua conta e risco, e qualquer problema, prejuízo ou dano deve ser resolvido entre as partes envolvidas.

5. Cancelamento
Você pode solicitar a exclusão da sua conta e dos seus anúncios a qualquer momento pelos canais de contato do portal.`,
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
  features: FeaturesConfig;
  terms: TermsConfig;
}

export const RADIUS_CSS: Record<ThemeConfig["radius"], string> = {
  none: "0px",
  sm: "4px",
  md: "10px",
  lg: "18px",
  full: "9999px",
};
