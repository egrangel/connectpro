import { listAllCategories } from "@/modules/categories/service";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "./actions";

interface AdminCategoriesPageProps {
  searchParams: Promise<{ error?: string }>;
}

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500";

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const [{ error }, categories] = await Promise.all([searchParams, listAllCategories()]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <form
        action={createCategoryAction}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Nova categoria
          <input type="text" name="name" required minLength={2} maxLength={60} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Ordem
          <input type="number" name="sortOrder" defaultValue={0} min={0} className={`${inputClass} w-20`} />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
          <input type="checkbox" name="isActive" defaultChecked /> Ativa
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Adicionar
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {categories.map((category) => (
          <li key={category.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <form action={updateCategoryAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={category.id} />
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                Nome
                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={60}
                  defaultValue={category.name}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                Ordem
                <input
                  type="number"
                  name="sortOrder"
                  min={0}
                  defaultValue={category.sortOrder}
                  className={`${inputClass} w-20`}
                />
              </label>
              <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
                <input type="checkbox" name="isActive" defaultChecked={category.isActive} /> Ativa
              </label>
              <span className="pb-2 text-xs text-slate-400">
                {category._count.listings}{" "}
                {category._count.listings === 1 ? "anúncio" : "anúncios"}
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Salvar
                </button>
                {category._count.listings === 0 && (
                  <button
                    type="submit"
                    formAction={deleteCategoryAction}
                    className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </form>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="text-sm text-slate-400">Nenhuma categoria cadastrada.</li>
        )}
      </ul>
    </div>
  );
}
