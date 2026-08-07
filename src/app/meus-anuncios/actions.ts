"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { LISTING_STATUS } from "@/lib/constants";
import { canManageListing, canPublishListing } from "@/modules/listings/authorization";
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
 * The status field is not rendered for authors, and this action never reads one
 * from the form: it decides the status itself. Trusting a submitted value would
 * make the missing field a UI suggestion rather than a rule.
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
    redirect("/meus-anuncios");
  }

  // An author's edit sends a published listing back to draft, so an approved
  // listing cannot be rewritten into something else while it is live. Admins
  // editing their own listing here keep whatever status it already had.
  const status =
    existing && canPublishListing(user) ? existing.status : LISTING_STATUS.DRAFT;

  const values: ListingFormValues = { ...readListingFormValues(formData), status };

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
      ? `/meus-anuncios/${listing.id}?saved=1`
      : `/meus-anuncios/${listing.id}?created=1#fotos`,
  );
}
