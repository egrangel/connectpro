import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/text";
import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(60),
  sortOrder: z.coerce.number().int().min(0).catch(0),
  isActive: z.boolean().catch(true),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;

export async function listActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listAllCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { listings: true } } },
  });
}

export async function createCategory(input: CategoryInput) {
  return prisma.category.create({
    data: { ...input, slug: slugify(input.name) },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  return prisma.category.update({
    where: { id },
    data: { ...input, slug: slugify(input.name) },
  });
}

/** Only categories without listings can be removed; otherwise deactivate. */
export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  const inUse = await prisma.listing.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return { ok: false, error: "Categoria em uso por anúncios — desative em vez de excluir." };
  }
  await prisma.category.delete({ where: { id } });
  return { ok: true };
}
