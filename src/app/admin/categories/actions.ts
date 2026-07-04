"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import {
  categoryInputSchema,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/modules/categories/service";

function backWithError(message: string): never {
  redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
}

function parseInput(formData: FormData) {
  return categoryInputSchema.safeParse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = parseInput(formData);
  if (!parsed.success) {
    backWithError(parsed.error.issues[0]?.message ?? "Dados inválidos");
  }
  try {
    await createCategory(parsed.data);
  } catch {
    backWithError("Já existe uma categoria com esse nome.");
  }
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseInput(formData);
  if (!id || !parsed.success) {
    backWithError(parsed.success ? "Categoria inválida" : parsed.error.issues[0]?.message ?? "Dados inválidos");
  }
  try {
    await updateCategory(id, parsed.data);
  } catch {
    backWithError("Já existe uma categoria com esse nome.");
  }
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const result = await deleteCategory(id);
  if (!result.ok) {
    backWithError(result.error ?? "Não foi possível excluir.");
  }
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}
