import { prisma } from "@/lib/prisma";
import { LISTING_STATUS, REVIEW_STATUS } from "@/lib/constants";
import { computeRatingAggregate } from "./aggregate";
import type { ReviewInput } from "./schema";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * Recomputes the denormalized listing aggregate from VISIBLE reviews inside
 * the same transaction as the review write — full recompute, never
 * incremental drift (docs/ARCHITECTURE.md §11).
 */
async function recomputeListingRating(tx: Tx, listingId: string): Promise<void> {
  const visible = await tx.review.findMany({
    where: { listingId, status: REVIEW_STATUS.VISIBLE },
    select: { rating: true },
  });
  const { avg, count } = computeRatingAggregate(visible.map((r) => r.rating));
  await tx.listing.update({
    where: { id: listingId },
    data: { ratingAvg: avg, ratingCount: count },
  });
}

export interface ReviewResult {
  ok: boolean;
  error?: string;
}

/** Creates or updates the caller's review (one per user per listing). */
export async function submitReview(
  input: ReviewInput,
  userId: string,
): Promise<ReviewResult> {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing || listing.status !== LISTING_STATUS.PUBLISHED) {
    return { ok: false, error: "Este anúncio não está disponível para avaliação." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.upsert({
      where: { listingId_userId: { listingId: input.listingId, userId } },
      create: {
        listingId: input.listingId,
        userId,
        rating: input.rating,
        comment: input.comment ?? null,
        status: REVIEW_STATUS.VISIBLE,
      },
      update: {
        rating: input.rating,
        comment: input.comment ?? null,
        status: REVIEW_STATUS.VISIBLE,
      },
    });
    await recomputeListingRating(tx, input.listingId);
  });
  return { ok: true };
}

export async function deleteOwnReview(
  reviewId: string,
  userId: string,
): Promise<ReviewResult> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== userId) {
    return { ok: false, error: "Avaliação não encontrada." };
  }
  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    await recomputeListingRating(tx, review.listingId);
  });
  return { ok: true };
}

/** Admin moderation: HIDDEN reviews leave public lists and aggregates but stay auditable. */
export async function setReviewStatus(
  reviewId: string,
  status: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS],
): Promise<ReviewResult> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    return { ok: false, error: "Avaliação não encontrada." };
  }
  await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id: reviewId }, data: { status } });
    await recomputeListingRating(tx, review.listingId);
  });
  return { ok: true };
}

export async function getVisibleReviews(listingId: string) {
  return prisma.review.findMany({
    where: { listingId, status: REVIEW_STATUS.VISIBLE },
    include: { user: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserReviewForListing(listingId: string, userId: string) {
  return prisma.review.findUnique({
    where: { listingId_userId: { listingId, userId } },
  });
}

export async function listAllReviewsForModeration() {
  return prisma.review.findMany({
    include: {
      user: { select: { displayName: true, email: true } },
      listing: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
