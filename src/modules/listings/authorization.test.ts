import { describe, expect, test } from "vitest";
import { ROLES } from "@/lib/constants";
import { canManageListing, canPublishListing } from "./authorization";

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
