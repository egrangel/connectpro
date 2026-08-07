"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import { deleteImageUpload, saveImageUpload } from "@/modules/media/storage";
import { getSiteFeatures } from "@/modules/settings/service";
import { canManageListing } from "./authorization";

/**
 * Photo actions shared by the admin panel and the author's own pages. Both
 * surfaces do the same work on the same rows, so the authorization lives here
 * once instead of being re-derived per route.
 */

/** Where to send the caller back to, since the two surfaces have their own pages. */
function listingUrl(listingId: string, isAdmin: boolean): string {
  return isAdmin ? `/admin/listings/${listingId}` : `/meus-anuncios/${listingId}`;
}

interface ListingAccess {
  isAdmin: boolean;
  backUrl: string;
}

/**
 * Loads a listing and confirms the caller may touch it, or leaves. Returns the
 * caller's surface so the action can redirect back to the right page.
 */
async function requireListingAccess(listingId: string): Promise<ListingAccess> {
  const user = await requireUser();
  const isAdmin = user.role === ROLES.ADMIN;

  const listing = listingId
    ? await prisma.listing.findUnique({
        where: { id: listingId },
        select: { createdById: true },
      })
    : null;

  // Same destination whether the listing is missing or simply not theirs: a
  // logged-in stranger should not learn which listing ids exist.
  if (!listing || !canManageListing(user, listing)) {
    redirect(isAdmin ? "/admin/listings" : "/meus-anuncios");
  }

  return { isAdmin, backUrl: listingUrl(listingId, isAdmin) };
}

function revalidatePublic(): void {
  revalidatePath("/", "layout");
}

export async function uploadPhotoAction(formData: FormData): Promise<void> {
  const listingId = String(formData.get("listingId") ?? "");
  const { backUrl } = await requireListingAccess(listingId);

  const [photoCount, { maxPhotosPerListing }] = await Promise.all([
    prisma.listingPhoto.count({ where: { listingId } }),
    getSiteFeatures(),
  ]);
  const remaining = maxPhotosPerListing - photoCount;

  if (remaining <= 0) {
    redirect(
      `${backUrl}?error=${encodeURIComponent(
        `Limite de ${maxPhotosPerListing} fotos por anúncio atingido.`,
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
  const photoId = String(formData.get("photoId") ?? "");
  const photo = photoId
    ? await prisma.listingPhoto.findUnique({
        where: { id: photoId },
        select: { id: true, listingId: true, storageKey: true },
      })
    : null;

  // Authorize against the photo's own listing, never a listing id from the
  // form — otherwise a caller could pair their listing with someone else's
  // photo id and delete it.
  const { backUrl } = await requireListingAccess(photo?.listingId ?? "");
  if (!photo) redirect(backUrl);

  await prisma.listingPhoto.delete({ where: { id: photo.id } });
  await deleteImageUpload(photo.storageKey);
  revalidatePublic();
  redirect(backUrl);
}
