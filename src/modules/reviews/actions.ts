"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { reviewInputSchema } from "./schema";
import { deleteOwnReview, submitReview } from "./service";

function backToListing(slug: string, error?: string): never {
  const suffix = error ? `?reviewError=${encodeURIComponent(error)}` : "";
  redirect(`/p/${slug}${suffix}#avaliacoes`);
}

export async function submitReviewAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("listingSlug") ?? "");
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/p/${slug}`)}`);
  }

  const parsed = reviewInputSchema.safeParse({
    listingId: formData.get("listingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    backToListing(slug, parsed.error.issues[0]?.message ?? "Dados inválidos");
  }
  if (!checkRateLimit(`review:${user.id}`, RATE_LIMITS.review)) {
    backToListing(slug, "Muitas avaliações em pouco tempo. Tente mais tarde.");
  }

  const result = await submitReview(parsed.data, user.id);
  if (!result.ok) {
    backToListing(slug, result.error ?? "Não foi possível salvar a avaliação.");
  }
  revalidatePath(`/p/${slug}`);
  backToListing(slug);
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("listingSlug") ?? "");
  const reviewId = String(formData.get("reviewId") ?? "");
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const result = await deleteOwnReview(reviewId, user.id);
  if (!result.ok) {
    backToListing(slug, result.error ?? "Não foi possível excluir a avaliação.");
  }
  revalidatePath(`/p/${slug}`);
  backToListing(slug);
}
