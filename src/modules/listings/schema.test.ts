import { describe, expect, test } from "vitest";
import { listingInputSchema, listingQuerySchema } from "./schema";

const validListing = {
  title: "Eletricista João",
  description: "Instalações elétricas residenciais com garantia.",
  categoryId: "cat-1",
  status: "PUBLISHED",
};

describe("listingInputSchema", () => {
  test("accepts a minimal valid listing", () => {
    const result = listingInputSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  test("converts empty optional strings to null", () => {
    const result = listingInputSchema.parse({
      ...validListing,
      contactEmail: "",
      websiteUrl: "",
      city: "",
    });
    expect(result.contactEmail).toBeNull();
    expect(result.websiteUrl).toBeNull();
    expect(result.city).toBeNull();
  });

  test("rejects invalid contact email and status", () => {
    expect(
      listingInputSchema.safeParse({ ...validListing, contactEmail: "not-an-email" }).success,
    ).toBe(false);
    expect(
      listingInputSchema.safeParse({ ...validListing, status: "DELETED" }).success,
    ).toBe(false);
  });

  test("rejects too-short title", () => {
    expect(listingInputSchema.safeParse({ ...validListing, title: "ab" }).success).toBe(false);
  });
});

describe("listingQuerySchema", () => {
  test("applies safe defaults for missing values", () => {
    const query = listingQuerySchema.parse({});
    expect(query.sort).toBe("recent");
    expect(query.page).toBe(1);
  });

  test("falls back instead of throwing on garbage input", () => {
    const query = listingQuerySchema.parse({ sort: "hacked", page: "-3" });
    expect(query.sort).toBe("recent");
    expect(query.page).toBe(1);
  });

  test("coerces valid numeric page strings", () => {
    expect(listingQuerySchema.parse({ page: "4" }).page).toBe(4);
  });
});
