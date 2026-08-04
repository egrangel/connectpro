import { LISTING_STATUS } from "@/lib/constants";
import { searchTerms } from "@/lib/text";
import type { ListingQuery } from "./schema";
import type { Prisma } from "@prisma/client";

/**
 * Public search predicate. Every query term must match somewhere, but each one
 * may match either the listing text (`searchText`, normalized at write time) or
 * the listing's category slug — searching "fotografo" has to find listings
 * filed under "Fotógrafo" even when the word never appears in their text.
 */
export function listingWhere(query: ListingQuery): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.PUBLISHED };

  if (query.category) {
    where.category = { slug: query.category };
  }

  const terms = searchTerms(query.q);
  if (terms.length > 0) {
    // Category slugs are already lowercase and unaccented (see slugify), so a
    // normalized term compares directly against them.
    where.AND = terms.map((term) => ({
      OR: [
        { searchText: { contains: term } },
        { category: { slug: { contains: term } } },
      ],
    }));
  }

  return where;
}
