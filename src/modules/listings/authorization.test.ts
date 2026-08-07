import { describe, expect, test } from "vitest";
import { LISTING_STATUS, ROLES } from "@/lib/constants";
import {
  canManageListing,
  canPublishListing,
  resolveListingStatus,
} from "./authorization";

const owner = { id: "user-1", role: ROLES.USER };
const otherUser = { id: "user-2", role: ROLES.USER };
const admin = { id: "admin-1", role: ROLES.ADMIN };
const listing = { createdById: "user-1" };

describe("canManageListing", () => {
  test("the author may manage their own listing", () => {
    expect(canManageListing(owner, listing)).toBe(true);
  });

  test("another user may not, even while logged in", () => {
    // The listing id comes from a form field, so this is the case that stops
    // someone editing a stranger's listing by posting its id.
    expect(canManageListing(otherUser, listing)).toBe(false);
  });

  test("an admin may manage any listing", () => {
    expect(canManageListing(admin, listing)).toBe(true);
    expect(canManageListing(admin, { createdById: "someone-else" })).toBe(true);
  });
});

describe("canPublishListing", () => {
  test("only admins decide what goes live", () => {
    expect(canPublishListing(admin)).toBe(true);
    expect(canPublishListing(owner)).toBe(false);
    expect(canPublishListing(otherUser)).toBe(false);
  });
});

describe("resolveListingStatus", () => {
  test("an admin's chosen status is the one that is stored", () => {
    expect(resolveListingStatus(admin, LISTING_STATUS.PUBLISHED)).toBe(
      LISTING_STATUS.PUBLISHED,
    );
    expect(resolveListingStatus(admin, LISTING_STATUS.ARCHIVED)).toBe(
      LISTING_STATUS.ARCHIVED,
    );
  });

  test("an author's listing is a draft even when the form posts a status", () => {
    // The field is not rendered for authors, so this is the hand-crafted POST:
    // hiding the select must not be what keeps a listing off the site.
    expect(resolveListingStatus(owner, LISTING_STATUS.PUBLISHED)).toBe(
      LISTING_STATUS.DRAFT,
    );
    expect(resolveListingStatus(owner, "")).toBe(LISTING_STATUS.DRAFT);
  });
});
