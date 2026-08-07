import { ROLES } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth/session";

/**
 * Who may edit a listing and its photos: its author, or any admin.
 *
 * Listing ids travel in form fields, so every action that acts on one has to
 * ask this — a logged-in user posting someone else's id is the obvious attack
 * once creation is open beyond /admin.
 */
export function canManageListing(
  user: Pick<SessionUser, "id" | "role">,
  listing: { createdById: string },
): boolean {
  return user.role === ROLES.ADMIN || listing.createdById === user.id;
}

/**
 * Whether the caller may decide if a listing is published.
 *
 * Authors always submit drafts and cannot change status, so publication stays
 * an admin decision — that gate is the whole point of letting users create.
 */
export function canPublishListing(user: Pick<SessionUser, "role">): boolean {
  return user.role === ROLES.ADMIN;
}
