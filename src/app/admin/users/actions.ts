"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { ROLES, type Role } from "@/lib/constants";
import { setUserActive, setUserRole } from "@/modules/users/service";

function finish(error?: string): never {
  revalidatePath("/admin/users");
  redirect(error ? `/admin/users?error=${encodeURIComponent(error)}` : "/admin/users");
}

export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const isCurrentlyActive = formData.get("isActive") === "true";

  const result = await setUserActive(userId, !isCurrentlyActive, admin.id);
  finish(result.error);
}

export async function toggleUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const currentRole = String(formData.get("currentRole") ?? "");

  const nextRole: Role = currentRole === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;
  const result = await setUserRole(userId, nextRole, admin.id);
  finish(result.error);
}
