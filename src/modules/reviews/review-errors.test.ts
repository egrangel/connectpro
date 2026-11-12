import { describe, expect, test } from "vitest";
import {
  REVIEW_FALLBACK_ERROR,
  REVIEW_NOT_FOUND_ERROR,
  REVIEW_RATE_LIMIT_ERROR,
  REVIEW_UNAVAILABLE_ERROR,
  resolveReviewError,
} from "./review-errors";
import { reviewInputSchema } from "./schema";

function firstMessage(input: Record<string, unknown>): string {
  const result = reviewInputSchema.safeParse(input);
  if (result.success) throw new Error("expected the input to fail validation");
  return result.error.issues[0].message;
}

describe("resolveReviewError", () => {
  test("returns nothing when there is no error", () => {
    expect(resolveReviewError(undefined)).toBeNull();
    expect(resolveReviewError("")).toBeNull();
  });

  test("shows the messages the review flow sends", () => {
    for (const message of [REVIEW_RATE_LIMIT_ERROR, REVIEW_UNAVAILABLE_ERROR, REVIEW_NOT_FOUND_ERROR]) {
      expect(resolveReviewError(message)).toBe(message);
    }
  });

  test("replaces text that did not come from the review flow", () => {
    // ?reviewError= is part of the URL, so anyone can put text there; the
    // listing page must never display it on the real domain.
    expect(resolveReviewError("Este profissional foi denunciado, ligue para 0800")).toBe(REVIEW_FALLBACK_ERROR);
  });

  test("replaces zod's default English messages too", () => {
    // listingId has no custom message, so a missing id fails in English.
    const message = firstMessage({ listingId: "", rating: 5 });
    expect(resolveReviewError(message)).toBe(REVIEW_FALLBACK_ERROR);
  });
});

// If a schema message changes, the allowlist must change with it; otherwise the
// visitor gets the fallback instead of the real reason.
describe("every custom schema message is on the allowlist", () => {
  test.each([
    ["rating out of range", { listingId: "x", rating: 0 }],
    ["rating not whole", { listingId: "x", rating: 2.5 }],
    ["comment too long", { listingId: "x", rating: 5, comment: "x".repeat(2001) }],
  ])("%s", (_label, input) => {
    const message = firstMessage(input);
    expect(resolveReviewError(message)).toBe(message);
  });
});
