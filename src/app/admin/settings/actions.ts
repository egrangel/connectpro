"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import {
  bannerSchema,
  brandingSchema,
  themeSchema,
} from "@/modules/settings/schema";
import { getSiteConfig, updateSiteConfig } from "@/modules/settings/service";
import { saveImageUpload } from "@/modules/media/storage";

function backWithError(message: string): never {
  redirect(`/admin/settings?error=${encodeURIComponent(message)}`);
}

async function resolveImageKey(
  file: FormDataEntryValue | null,
  removeFlag: boolean,
  currentKey: string | null,
): Promise<string | null> {
  if (removeFlag) return null;
  if (file instanceof File && file.size > 0) {
    const saved = await saveImageUpload(file);
    if (!saved.ok || !saved.storageKey) {
      backWithError(saved.error ?? "Falha no upload da imagem.");
    }
    return saved.storageKey;
  }
  return currentKey;
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const current = await getSiteConfig();

  const rawCount = parseInt(String(formData.get("slideCount") ?? "1"), 10);
  const slideCount = Math.min(5, Math.max(1, Number.isNaN(rawCount) ? 1 : rawCount));

  const resolvedSlides: Array<Record<string, unknown>> = [];
  for (let i = 0; i < slideCount; i++) {
    const currentImageKey = (formData.get(`slide_${i}_imageKey`) as string) || null;
    const imageKey = await resolveImageKey(
      formData.get(`bannerImage_${i}`),
      formData.get(`removeBannerImage_${i}`) === "on",
      currentImageKey,
    );
    resolvedSlides.push({
      imageKey,
      headline: formData.get(`slide_${i}_headline`),
      subheadline: formData.get(`slide_${i}_subheadline`),
      ctaText: formData.get(`slide_${i}_ctaText`),
      ctaUrl: formData.get(`slide_${i}_ctaUrl`),
    });
  }

  const logoKey = await resolveImageKey(
    formData.get("logo"),
    formData.get("removeLogo") === "on",
    current.branding.logoKey,
  );

  const banner = bannerSchema.safeParse({
    enabled: formData.get("bannerEnabled") === "on",
    slides: resolvedSlides,
  });
  const theme = themeSchema.safeParse({
    primary: formData.get("primary"),
    accent: formData.get("accent"),
    surface: formData.get("surface"),
    text: formData.get("text"),
    radius: formData.get("radius"),
  });
  const branding = brandingSchema.safeParse({
    siteName: formData.get("siteName"),
    logoKey,
    footerText: formData.get("footerText"),
  });

  const firstError =
    (!banner.success && banner.error.issues[0]?.message) ||
    (!theme.success && theme.error.issues[0]?.message) ||
    (!branding.success && branding.error.issues[0]?.message);
  if (!banner.success || !theme.success || !branding.success) {
    backWithError(firstError || "Dados inválidos.");
  }

  await updateSiteConfig({
    banner: banner.data,
    theme: theme.data,
    branding: branding.data,
  });

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
