import { describe, expect, test } from "vitest";
import { computeRatingAggregate, computeRatingDistribution } from "./aggregate";

describe("computeRatingAggregate", () => {
  test("returns zeros for empty input", () => {
    expect(computeRatingAggregate([])).toEqual({ avg: 0, count: 0 });
  });

  test("computes the mean of ratings", () => {
    expect(computeRatingAggregate([5, 4, 3])).toEqual({ avg: 4, count: 3 });
  });

  test("rounds to two decimals", () => {
    expect(computeRatingAggregate([5, 4])).toEqual({ avg: 4.5, count: 2 });
    expect(computeRatingAggregate([5, 5, 4])).toEqual({ avg: 4.67, count: 3 });
    expect(computeRatingAggregate([1, 1, 2])).toEqual({ avg: 1.33, count: 3 });
  });

  test("single rating equals itself", () => {
    expect(computeRatingAggregate([3])).toEqual({ avg: 3, count: 1 });
  });
});

describe("computeRatingDistribution", () => {
  test("counts each star bucket", () => {
    expect(computeRatingDistribution([5, 5, 4, 1])).toEqual({
      1: 1,
      2: 0,
      3: 0,
      4: 1,
      5: 2,
    });
  });

  test("ignores out-of-range values defensively", () => {
    expect(computeRatingDistribution([0, 6, 3])).toEqual({
      1: 0,
      2: 0,
      3: 1,
      4: 0,
      5: 0,
    });
  });
});
