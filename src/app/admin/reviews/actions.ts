"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { REVIEW_STATUS } from "@/lib/constants";
import { setReviewStatus } from "@/modules/reviews/service";

export async function toggleReviewVisibilityAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const currentStatus = String(formData.get("currentStatus") ?? "");

  const nextStatus =
    currentStatus === REVIEW_STATUS.VISIBLE ? REVIEW_STATUS.HIDDEN : REVIEW_STATUS.VISIBLE;

  await setReviewStatus(reviewId, nextStatus);
  revalidatePath("/", "layout");
  redirect("/admin/reviews");
}
