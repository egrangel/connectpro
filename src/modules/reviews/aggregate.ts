export interface RatingAggregate {
  avg: number;
  count: number;
}

/** Average rounded to 2 decimals; empty input yields { avg: 0, count: 0 }. */
export function computeRatingAggregate(ratings: readonly number[]): RatingAggregate {
  if (ratings.length === 0) {
    return { avg: 0, count: 0 };
  }
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return {
    avg: Math.round((sum / ratings.length) * 100) / 100,
    count: ratings.length,
  };
}

/** Distribution for the detail page bars: { 5: n, 4: n, ... }. */
export function computeRatingDistribution(
  ratings: readonly number[],
): Record<1 | 2 | 3 | 4 | 5, number> {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const rating of ratings) {
    if (rating >= 1 && rating <= 5) {
      distribution[rating as 1 | 2 | 3 | 4 | 5] += 1;
    }
  }
  return distribution;
}
