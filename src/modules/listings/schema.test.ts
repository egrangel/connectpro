import { describe, expect, test } from "vitest";
import { SEARCH_QUERY_MAX_LENGTH } from "@/lib/constants";
import { listingInputSchema, listingQuerySchema } from "./schema";

const validListing = {
  title: "Eletricista Joao",
  description: "Instalacoes eletricas residenciais com garantia.",
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

  test("accepts absolute HTTP(S) website URLs", () => {
    expect(
      listingInputSchema.safeParse({ ...validListing, websiteUrl: "https://example.com" })
        .success,
    ).toBe(true);
  });

  test("rejects unsafe website URL schemes", () => {
    expect(
      listingInputSchema.safeParse({ ...validListing, websiteUrl: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(
      listingInputSchema.safeParse({ ...validListing, websiteUrl: "mailto:test@example.com" })
        .success,
    ).toBe(false);
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

  test("stores Instagram as a bare handle, whatever form was pasted", () => {
    const fromUrl = listingInputSchema.parse({
      ...validListing,
      instagram: "https://www.instagram.com/Joao.Silva/?igsh=MXY2cHJ5",
    });
    expect(fromUrl.instagram).toBe("joao.silva");

    const fromAt = listingInputSchema.parse({ ...validListing, instagram: "@joao.silva" });
    expect(fromAt.instagram).toBe("joao.silva");
  });

  test("treats a blank Instagram as no Instagram", () => {
    expect(listingInputSchema.parse({ ...validListing, instagram: "" }).instagram).toBeNull();
    expect(listingInputSchema.parse({ ...validListing, instagram: "   " }).instagram).toBeNull();
  });

  test("rejects an Instagram value that is not a profile", () => {
    // Nothing user-supplied may become an href, so these must never be stored.
    for (const value of [
      "javascript:alert(1)",
      "https://evil.example/joao",
      "https://instagram.com.evil.example/joao",
      "joao silva",
    ]) {
      expect(
        listingInputSchema.safeParse({ ...validListing, instagram: value }).success,
      ).toBe(false);
    }
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

  test("truncates an over-long query instead of throwing", () => {
    // Regression: a pasted wall of text used to reject and 500 the home page.
    const query = listingQuerySchema.parse({ q: "a".repeat(500) });
    expect(query.q).toBe("a".repeat(SEARCH_QUERY_MAX_LENGTH));
  });

  test("keeps queries at the limit intact and trims surrounding space", () => {
    const atLimit = "b".repeat(SEARCH_QUERY_MAX_LENGTH);
    expect(listingQuerySchema.parse({ q: atLimit }).q).toBe(atLimit);
    expect(listingQuerySchema.parse({ q: "  pintor  " }).q).toBe("pintor");
  });

  test("drops an over-long category filter instead of throwing", () => {
    expect(listingQuerySchema.parse({ category: "c".repeat(500) }).category).toBeUndefined();
  });
});