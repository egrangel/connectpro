import Link from "next/link";
import { listAllReviewsForModeration } from "@/modules/reviews/service";
import { REVIEW_STATUS } from "@/lib/constants";
import { StarRating } from "@/components/ui/StarRating";
import { toggleReviewVisibilityAction } from "./actions";

export default async function AdminReviewsPage() {
  const reviews = await listAllReviewsForModeration();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Moderação de avaliações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Avaliações ocultas saem do site e da média do anúncio, mas ficam registradas.
      </p>

      <ul className="mt-6 space-y-3">
        {reviews.map((review) => {
          const isHidden = review.status === REVIEW_STATUS.HIDDEN;
          return (
            <li
              key={review.id}
              className={`rounded-lg border bg-white p-4 ${
                isHidden ? "border-amber-300 bg-amber-50/40" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating value={review.rating} />
                  <span className="font-medium text-slate-800">
                    {review.user.displayName}
                  </span>
                  <span className="text-slate-400">({review.user.email})</span>
                  <span className="text-slate-400">em</span>
                  <Link
                    href={`/p/${review.listing.slug}`}
                    className="font-medium text-slate-700 hover:underline"
                  >
                    {review.listing.title}
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  {isHidden && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Oculta
                    </span>
                  )}
                  <form action={toggleReviewVisibilityAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="currentStatus" value={review.status} />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {isHidden ? "Restaurar" : "Ocultar"}
                    </button>
                  </form>
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                  {review.comment}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {review.createdAt.toLocaleString("pt-BR")}
              </p>
            </li>
          );
        })}
        {reviews.length === 0 && (
          <li className="text-sm text-slate-400">Nenhuma avaliação registrada ainda.</li>
        )}
      </ul>
    </div>
  );
}
