// Messages the review actions send back through ?reviewError=. The URL is
// public, so the listing page shows only these and replaces anything else:
// otherwise anyone could craft a link that puts their own text under a
// professional's reviews on the real domain.

export const REVIEW_RATE_LIMIT_ERROR = "Muitas avaliações em pouco tempo. Tente mais tarde.";
export const REVIEW_UNAVAILABLE_ERROR = "Este anúncio não está disponível para avaliação.";
export const REVIEW_NOT_FOUND_ERROR = "Avaliação não encontrada.";
export const REVIEW_SAVE_ERROR = "Não foi possível salvar a avaliação.";
export const REVIEW_DELETE_ERROR = "Não foi possível excluir a avaliação.";

export const REVIEW_FALLBACK_ERROR = "Não foi possível concluir a avaliação. Tente de novo.";

// Keep in sync with reviewInputSchema (schema.ts); review-errors.test.ts fails
// when a custom schema message is missing here.
const KNOWN_REVIEW_ERRORS: ReadonlySet<string> = new Set([
  REVIEW_RATE_LIMIT_ERROR,
  REVIEW_UNAVAILABLE_ERROR,
  REVIEW_NOT_FOUND_ERROR,
  REVIEW_SAVE_ERROR,
  REVIEW_DELETE_ERROR,
  "Avaliação inválida",
  "Escolha de 1 a 5 estrelas",
  "Comentário muito longo",
]);

export function resolveReviewError(raw: string | undefined): string | null {
  if (!raw) return null;
  return KNOWN_REVIEW_ERRORS.has(raw) ? raw : REVIEW_FALLBACK_ERROR;
}
