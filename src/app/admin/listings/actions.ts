"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { listingInputSchema } from "@/modules/listings/schema";
import {
  readListingFormValues,
  type ListingFormValues,
  type SaveListingState,
} from "@/modules/listings/form-state";
import {
  archiveListing,
  createListing,
  updateListing,
} from "@/modules/listings/service";

function revalidatePublic(): void {
  revalidatePath("/", "layout");
}

export async function saveListingAction(
  _prevState: SaveListingState,
  formData: FormData,
): Promise<SaveListingState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const values: ListingFormValues = {
    ...readListingFormValues(formData),
    status: String(formData.get("status") ?? ""),
  };

  const parsed = listingInputSchema.safeParse(values);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return { error: message, values };
  }

  const isNew = !id;
  const listing = isNew
    ? await createListing(parsed.data, admin.id)
    : await updateListing(id, parsed.data);

  revalidatePublic();
  // Photos need a listing id to attach to, so they only become available now.
  // Send a freshly created listing straight to that section instead of leaving
  // the admin on a page whose next step is below the fold.
  redirect(
    isNew
      ? `/admin/listings/${listing.id}?created=1#photos`
      : `/admin/listings/${listing.id}?saved=1`,
  );
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
