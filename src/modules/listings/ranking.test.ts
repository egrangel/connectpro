import { describe, expect, test } from "vitest";
import { RATING_SORT_MIN_REVIEWS } from "@/lib/constants";
import { compareRatingRank, type RatingRankableListing } from "./ranking";

function listing(
  ratingAvg: number,
  ratingCount: number,
  createdAt = "2026-01-01T00:00:00.000Z",
): RatingRankableListing {
  return { ratingAvg, ratingCount, createdAt: new Date(createdAt) };
}

describe("compareRatingRank", () => {
  test("prioritizes listings with enough reviews over low-sample perfect ratings", () => {
    const established = listing(4.2, RATING_SORT_MIN_REVIEWS);
    const lowSample = listing(5, RATING_SORT_MIN_REVIEWS - 1);

    expect([lowSample, established].sort(compareRatingRank)).toEqual([
      established,
      lowSample,
    ]);
  });

  test("orders eligible listings by average, then count, then recency", () => {
    const older = listing(4.8, 5, "2026-01-01T00:00:00.000Z");
    const newer = listing(4.8, 5, "2026-02-01T00:00:00.000Z");
    const moreReviews = listing(4.8, 8, "2026-01-01T00:00:00.000Z");
    const higherAverage = listing(4.9, 3, "2026-01-01T00:00:00.000Z");

    expect([older, newer, moreReviews, higherAverage].sort(compareRatingRank)).toEqual([
      higherAverage,
      moreReviews,
      newer,
      older,
    ]);
  });
});