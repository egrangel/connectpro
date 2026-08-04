import { describe, expect, test } from "vitest";
import { LISTING_STATUS } from "@/lib/constants";
import { listingQuerySchema } from "./schema";
import { listingWhere } from "./where";

function buildQuery(overrides: Record<string, unknown> = {}) {
  return listingQuerySchema.parse({ sort: "recent", page: 1, ...overrides });
}

describe("listingWhere", () => {
  test("restricts to published listings", () => {
    expect(listingWhere(buildQuery())).toEqual({
      status: LISTING_STATUS.PUBLISHED,
    });
  });

  test("filters by category slug when a category chip is active", () => {
    expect(listingWhere(buildQuery({ category: "fotografo" }))).toMatchObject({
      category: { slug: "fotografo" },
    });
  });

  test("matches a term against listing text or its category", () => {
    expect(listingWhere(buildQuery({ q: "fotografo" })).AND).toEqual([
      {
        OR: [
          { searchText: { contains: "fotografo" } },
          { category: { slug: { contains: "fotografo" } } },
        ],
      },
    ]);
  });

  test("requires every term to match, in any order", () => {
    const where = listingWhere(buildQuery({ q: "Fotógrafo Curitiba" }));
    expect(where.AND).toHaveLength(2);
    expect(where.AND).toEqual([
      expect.objectContaining({
        OR: expect.arrayContaining([{ searchText: { contains: "fotografo" } }]),
      }),
      expect.objectContaining({
        OR: expect.arrayContaining([{ searchText: { contains: "curitiba" } }]),
      }),
    ]);
  });

  test("ignores a query with no usable terms", () => {
    expect(listingWhere(buildQuery({ q: "!!!" }))).toEqual({
      status: LISTING_STATUS.PUBLISHED,
    });
  });
});
