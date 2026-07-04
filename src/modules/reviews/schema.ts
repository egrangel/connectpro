import { z } from "zod";
import { RATING_MAX, RATING_MIN, REVIEW_COMMENT_MAX_LENGTH } from "@/lib/constants";

export const reviewInputSchema = z.object({
  listingId: z.string().min(1),
  rating: z.coerce
    .number()
    .int("Avaliação inválida")
    .min(RATING_MIN, "Escolha de 1 a 5 estrelas")
    .max(RATING_MAX, "Escolha de 1 a 5 estrelas"),
  comment: z
    .string()
    .trim()
    .max(REVIEW_COMMENT_MAX_LENGTH, "Comentário muito longo")
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;
