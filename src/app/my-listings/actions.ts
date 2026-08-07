"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { canManageListing, resolveListingStatus } from "@/modules/listings/authorization";
import {
  readListingFormValues,
  type ListingFormValues,
  type SaveListingState,
} from "@/modules/listings/form-state";
import { listingInputSchema } from "@/modules/listings/schema";
import {
  createListing,
  getListingById,
  updateListing,
} from "@/modules/listings/service";

/**
 * Listing create/edit for the author's own pages.
 *
 * An admin gets the same pages as everyone else from the site header, so the
 * submitted status is read here — but only resolveListingStatus decides whether
 * it counts. For an author it is discarded, which is what keeps the hidden
 * status field a courtesy rather than the rule.
 */
export async function saveOwnListingAction(
  _prevState: SaveListingState,
  formData: FormData,
): Promise<SaveListingState> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  const existing = id ? await getListingById(id) : null;
  if (id && (!existing || !canManageListing(user, existing))) {
    // Missing and not-yours look identical on purpose.
    redirect("/my-listings");
  }

  const values: ListingFormValues = {
    ...readListingFormValues(formData),
    status: resolveListingStatus(user, String(formData.get("status") ?? "")),
  };

  const parsed = listingInputSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos", values };
  }

  const listing = existing
    ? await updateListing(existing.id, parsed.data)
    : await createListing(parsed.data, user.id);

  revalidatePath("/", "layout");
  redirect(
    existing
      ? `/my-listings/${listing.id}?saved=1`
      : `/my-listings/${listing.id}?created=1#photos`,
  );
}
