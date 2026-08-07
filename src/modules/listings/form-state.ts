/**
 * Shape passed between the listing form and whichever server action handles it.
 *
 * Kept out of the action files so the client component can import the types
 * without pulling in a "use server" module.
 */
export interface ListingFormValues {
  title: string;
  description: string;
  categoryId: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  instagram: string;
  websiteUrl: string;
  city: string;
  status: string;
}

export interface SaveListingState {
  error: string | null;
  // Echoes the submitted values back so the form can repopulate on error
  // instead of wiping everything the user typed.
  values: ListingFormValues | null;
}

/** Reads the listing fields an author is allowed to set. Status is never one. */
export function readListingFormValues(formData: FormData): Omit<ListingFormValues, "status"> {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactWhatsapp: String(formData.get("contactWhatsapp") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    websiteUrl: String(formData.get("websiteUrl") ?? ""),
    city: String(formData.get("city") ?? ""),
  };
}
