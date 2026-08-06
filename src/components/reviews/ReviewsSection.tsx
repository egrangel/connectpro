import Link from "next/link";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { computeRatingDistribution } from "@/modules/reviews/aggregate";
import { deleteReviewAction } from "@/modules/reviews/actions";
import type { getVisibleReviews } from "@/modules/reviews/service";

type VisibleReview = Awaited<ReturnType<typeof getVisibleReviews>>[number];

interface ReviewsSectionProps {
  listingId: string;
  listingSlug: string;
  ratingAvg: number;
  ratingCount: number;
  reviews: VisibleReview[];
  ownRating: number;
  ownComment: string;
  currentUserId: string | null;
  error?: string;
}

/**
 * Public reviews block of a listing page. Rendered only when the review system
 * is enabled in Configurações (see settings featuresSchema.reviewsEnabled).
 */
export function ReviewsSection({
  listingId,
  listingSlug,
  ratingAvg,
  ratingCount,
  reviews,
  ownRating,
  ownComment,
  currentUserId,
  error,
}: ReviewsSectionProps) {
  const distribution = computeRatingDistribution(reviews.map((r) => r.rating));

  return (
    <section id="avaliacoes" className="mt-12" aria-label="Avaliacoes">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--color-primary)]">Experiencias</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Avaliacoes</h2>
        </div>
      </div>

      {ratingCount > 0 && (
        <div className="card-surface mt-5 flex flex-col gap-5 rounded-[calc(var(--radius)+8px)] p-5 sm:flex-row sm:items-center sm:gap-8">
          <div className="text-center sm:w-36">
            <p className="text-5xl font-bold">{ratingAvg.toFixed(1)}</p>
            <StarRating value={ratingAvg} size="md" />
            <p className="mt-1 text-xs text-[var(--color-muted)]">{ratingCount} avaliacoes</p>
          </div>
          <div className="flex-1 space-y-2">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = distribution[stars];
              const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-[var(--color-muted)]">{stars}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_10%,white)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 text-[var(--color-muted)]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        {currentUserId ? (
          <ReviewForm
            listingId={listingId}
            listingSlug={listingSlug}
            initialRating={ownRating}
            initialComment={ownComment}
            error={error}
          />
        ) : (
          <p className="card-surface rounded-[calc(var(--radius)+8px)] p-5 text-sm text-[var(--color-muted)]">
            <Link
              href={`/login?next=${encodeURIComponent(`/p/${listingSlug}`)}`}
              className="font-bold text-[var(--color-primary)] hover:underline"
            >
              Entre na sua conta
            </Link>{" "}
            para avaliar este profissional.
          </p>
        )}
      </div>

      <ul className="mt-6 space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="card-surface rounded-[calc(var(--radius)+8px)] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold">{review.user.displayName}</span>
                <StarRating value={review.rating} />
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                <time dateTime={review.createdAt.toISOString()}>
                  {review.createdAt.toLocaleDateString("pt-BR")}
                </time>
                {currentUserId === review.userId && (
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="listingSlug" value={listingSlug} />
                    <button type="submit" className="font-bold text-red-600 hover:underline">
                      Excluir
                    </button>
                  </form>
                )}
              </div>
            </div>
            {review.comment && (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--color-muted)]">
                {review.comment}
              </p>
            )}
          </li>
        ))}
        {reviews.length === 0 && (
          <li className="text-sm text-[var(--color-muted)]">
            Este profissional ainda nao recebeu avaliacoes. Seja o primeiro!
          </li>
        )}
      </ul>
    </section>
  );
}
