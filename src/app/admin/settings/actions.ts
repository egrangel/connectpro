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

  const bannerImageKey = await resolveImageKey(
    formData.get("bannerImage"),
    formData.get("removeBannerImage") === "on",
    current.banner.imageKey,
  );
  const logoKey = await resolveImageKey(
    formData.get("logo"),
    formData.get("removeLogo") === "on",
    current.branding.logoKey,
  );

  const banner = bannerSchema.safeParse({
    enabled: formData.get("bannerEnabled") === "on",
    imageKey: bannerImageKey,
    headline: formData.get("headline"),
    subheadline: formData.get("subheadline"),
    ctaText: formData.get("ctaText"),
    ctaUrl: formData.get("ctaUrl"),
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
