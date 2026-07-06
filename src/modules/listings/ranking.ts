import { RATING_SORT_MIN_REVIEWS } from "@/lib/constants";

export interface RatingRankableListing {
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
}

export function compareRatingRank(
  a: RatingRankableListing,
  b: RatingRankableListing,
): number {
  const aEligible = a.ratingCount >= RATING_SORT_MIN_REVIEWS ? 1 : 0;
  const bEligible = b.ratingCount >= RATING_SORT_MIN_REVIEWS ? 1 : 0;

  if (aEligible !== bEligible) return bEligible - aEligible;
  if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg;
  if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
  return b.createdAt.getTime() - a.createdAt.getTime();
}