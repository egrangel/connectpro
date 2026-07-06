import { prisma } from "@/lib/prisma";
import { LISTING_STATUS, LISTINGS_PAGE_SIZE } from "@/lib/constants";
import { slugify, toSearchText } from "@/lib/text";
import { compareRatingRank } from "./ranking";
import type { ListingInput, ListingQuery } from "./schema";
import type { Prisma } from "@prisma/client";

const publicListingInclude = {
  category: true,
  photos: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ListingInclude;

export type PublicListing = Prisma.ListingGetPayload<{
  include: typeof publicListingInclude;
}>;

export interface PublicListingPage {
  items: PublicListing[];
  total: number;
  page: number;
  pageCount: number;
}

function listingWhere(query: ListingQuery): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.PUBLISHED };

  if (query.category) {
    where.category = { slug: query.category };
  }
  if (query.q) {
    // searchText is pre-normalized (lowercase, unaccented) at write time.
    where.searchText = { contains: toSearchText(query.q) };
  }

  return where;
}

async function searchPublishedListingsByRating(
  query: ListingQuery,
  where: Prisma.ListingWhereInput,
): Promise<PublicListingPage> {
  const [total, ranked] = await prisma.$transaction([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      select: { id: true, ratingAvg: true, ratingCount: true, createdAt: true },
    }),
  ]);

  const pageIds = ranked
    .sort(compareRatingRank)
    .slice((query.page - 1) * LISTINGS_PAGE_SIZE, query.page * LISTINGS_PAGE_SIZE)
    .map((listing) => listing.id);

  if (pageIds.length === 0) {
    return {
      items: [],
      total,
      page: query.page,
      pageCount: Math.max(1, Math.ceil(total / LISTINGS_PAGE_SIZE)),
    };
  }

  const items = await prisma.listing.findMany({
    where: { id: { in: pageIds } },
    include: publicListingInclude,
  });
  const byId = new Map(items.map((listing) => [listing.id, listing]));

  return {
    items: pageIds.flatMap((id) => {
      const item = byId.get(id);
      return item ? [item] : [];
    }),
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / LISTINGS_PAGE_SIZE)),
  };
}

export async function searchPublishedListings(
  query: ListingQuery,
): Promise<PublicListingPage> {
  const where = listingWhere(query);

  if (query.sort === "rating") {
    return searchPublishedListingsByRating(query, where);
  }

  const [total, items] = await prisma.$transaction([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: publicListingInclude,
      skip: (query.page - 1) * LISTINGS_PAGE_SIZE,
      take: LISTINGS_PAGE_SIZE,
    }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / LISTINGS_PAGE_SIZE)),
  };
}

export async function getPublishedListingBySlug(
  slug: string,
): Promise<PublicListing | null> {
  return prisma.listing.findFirst({
    where: { slug, status: LISTING_STATUS.PUBLISHED },
    include: publicListingInclude,
  });
}

// ---------- Admin operations ----------

export async function listAllListings(statusFilter?: string) {
  return prisma.listing.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { category: true, photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { category: true, photos: { orderBy: { sortOrder: "asc" } } },
  });
}

async function ensureUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title) || "profissional";
  let candidate = base;
  let suffix = 2;
  // Bounded in practice: collisions require identical titles.
  for (;;) {
    const existing = await prisma.listing.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createListing(input: ListingInput, createdById: string) {
  const slug = await ensureUniqueSlug(input.title);
  return prisma.listing.create({
    data: {
      ...input,
      slug,
      searchText: toSearchText(input.title, input.description, input.city),
      createdById,
    },
  });
}

export async function updateListing(id: string, input: ListingInput) {
  const slug = await ensureUniqueSlug(input.title, id);
  return prisma.listing.update({
    where: { id },
    data: {
      ...input,
      slug,
      searchText: toSearchText(input.title, input.description, input.city),
    },
  });
}

/** Soft delete: listings are archived, never removed (reviews stay auditable). */
export async function archiveListing(id: string) {
  return prisma.listing.update({
    where: { id },
    data: { status: LISTING_STATUS.ARCHIVED },
  });
}