"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { MAX_PHOTOS_PER_LISTING } from "@/lib/constants";
import { listingInputSchema } from "@/modules/listings/schema";
import {
  archiveListing,
  createListing,
  updateListing,
} from "@/modules/listings/service";
import { deleteImageUpload, saveImageUpload } from "@/modules/media/storage";

function revalidatePublic(): void {
  revalidatePath("/", "layout");
}

export async function saveListingAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const parsed = listingInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail"),
    contactWhatsapp: formData.get("contactWhatsapp"),
    websiteUrl: formData.get("websiteUrl"),
    city: formData.get("city"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    const base = id ? `/admin/listings/${id}` : "/admin/listings/new";
    redirect(`${base}?error=${encodeURIComponent(message)}`);
  }

  const listing = id
    ? await updateListing(id, parsed.data)
    : await createListing(parsed.data, admin.id);

  revalidatePublic();
  redirect(`/admin/listings/${listing.id}?saved=1`);
}

export async function archiveListingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await archiveListing(id);
    revalidatePublic();
  }
  redirect("/admin/listings");
}

export async function uploadPhotoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const listingId = String(formData.get("listingId") ?? "");
  const backUrl = `/admin/listings/${listingId}`;

  if (!listingId) {
    redirect(`${backUrl}?error=${encodeURIComponent("Anúncio inválido.")}`);
  }

  const photoCount = await prisma.listingPhoto.count({ where: { listingId } });
  const remaining = MAX_PHOTOS_PER_LISTING - photoCount;

  if (remaining <= 0) {
    redirect(
      `${backUrl}?error=${encodeURIComponent(
        `Limite de ${MAX_PHOTOS_PER_LISTING} fotos por anúncio atingido.`,
      )}`,
    );
  }

  const files = formData
    .getAll("photo")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, remaining);

  if (files.length === 0) {
    redirect(`${backUrl}?error=${encodeURIComponent("Selecione ao menos uma imagem.")}`);
  }

  let firstError: string | undefined;
  let sortOrder = photoCount;

  for (const file of files) {
    const saved = await saveImageUpload(file);
    if (!saved.ok || !saved.storageKey) {
      firstError ??= saved.error ?? "Falha no upload.";
      continue;
    }
    await prisma.listingPhoto.create({
      data: { listingId, storageKey: saved.storageKey, sortOrder },
    });
    sortOrder++;
  }

  revalidatePublic();
  if (firstError) {
    redirect(`${backUrl}?error=${encodeURIComponent(firstError)}`);
  }
  redirect(backUrl);
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const photoId = String(formData.get("photoId") ?? "");
  const photo = await prisma.listingPhoto.findUnique({ where: { id: photoId } });
  if (photo) {
    await prisma.listingPhoto.delete({ where: { id: photoId } });
    await deleteImageUpload(photo.storageKey);
    revalidatePublic();
    redirect(`/admin/listings/${photo.listingId}`);
  }
  redirect("/admin/listings");
}
