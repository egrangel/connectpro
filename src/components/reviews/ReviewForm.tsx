"use client";

import { useState } from "react";
import { submitReviewAction } from "@/modules/reviews/actions";
import { REVIEW_COMMENT_MAX_LENGTH } from "@/lib/constants";

interface ReviewFormProps {
  listingId: string;
  listingSlug: string;
  initialRating?: number;
  initialComment?: string;
  error?: string;
}

export function ReviewForm({
  listingId,
  listingSlug,
  initialRating = 0,
  initialComment = "",
  error,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState(0);
  const isEditing = initialRating > 0;

  return (
    <form
      action={submitReviewAction}
      className="card-surface flex flex-col gap-4 rounded-[calc(var(--radius)+8px)] p-5"
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="listingSlug" value={listingSlug} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="mb-2 text-sm font-bold">
          {isEditing ? "Atualize sua avaliacao" : "Sua avaliacao"}
        </p>
        <div className="flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="rounded-full p-1 transition hover:scale-110 hover:bg-[color-mix(in_srgb,var(--color-accent)_12%,white)]"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-8 w-8 drop-shadow-sm"
                fill={star <= (hovered || rating) ? "var(--color-accent)" : "#d7dbe0"}
                aria-hidden
              >
                <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <textarea
        name="comment"
        defaultValue={initialComment}
        maxLength={REVIEW_COMMENT_MAX_LENGTH}
        rows={3}
        placeholder="Conte como foi sua experiencia (opcional)"
        className="w-full resize-y rounded-[var(--radius)] border border-[var(--color-line)] bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
      />

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={rating === 0}
        className="self-start rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_26px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isEditing ? "Atualizar avaliacao" : "Enviar avaliacao"}
      </button>
    </form>
  );
}