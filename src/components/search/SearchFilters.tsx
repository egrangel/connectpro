import Link from "next/link";
import type { Category } from "@prisma/client";
import type { ListingQuery } from "@/modules/listings/schema";

interface SearchFiltersProps {
  categories: Category[];
  query: ListingQuery;
}

function buildHref(query: ListingQuery, overrides: Partial<ListingQuery>): string {
  const merged = { ...query, ...overrides, page: 1 };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.category) params.set("category", merged.category);
  if (merged.sort !== "recent") params.set("sort", merged.sort);
  const qs = params.toString();
  return qs ? `/?${qs}#listagens` : "/#listagens";
}

/** Search + filters as GET form and links: state lives in the URL. */
export function SearchFilters({ categories, query }: SearchFiltersProps) {
  const chipBase =
    "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition";

  return (
    <div className="flex flex-col gap-4">
      <form action="/#listagens" method="get" className="flex gap-2">
        {query.category && <input type="hidden" name="category" value={query.category} />}
        {query.sort !== "recent" && <input type="hidden" name="sort" value={query.sort} />}
        <input
          type="search"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Buscar por serviço, nome ou descrição…"
          className="w-full rounded-[var(--radius)] border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
        <button
          type="submit"
          className="rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href={buildHref(query, { category: undefined })}
          className={`${chipBase} ${
            !query.category
              ? "border-transparent bg-[var(--color-primary)] text-white"
              : "border-black/10 bg-white text-black/70 hover:border-black/25"
          }`}
        >
          Todas
        </Link>
        {categories.map((category) => {
          const isActive = query.category === category.slug;
          return (
            <Link
              key={category.id}
              href={buildHref(query, { category: isActive ? undefined : category.slug })}
              className={`${chipBase} ${
                isActive
                  ? "border-transparent bg-[var(--color-primary)] text-white"
                  : "border-black/10 bg-white text-black/70 hover:border-black/25"
              }`}
            >
              {category.name}
            </Link>
          );
        })}

        <span className="mx-2 h-5 w-px shrink-0 bg-black/10" aria-hidden />
        <Link
          href={buildHref(query, { sort: "recent" })}
          className={`${chipBase} ${
            query.sort === "recent"
              ? "border-black/25 bg-black/5 text-black"
              : "border-black/10 bg-white text-black/60 hover:border-black/25"
          }`}
        >
          Recentes
        </Link>
        <Link
          href={buildHref(query, { sort: "rating" })}
          className={`${chipBase} ${
            query.sort === "rating"
              ? "border-black/25 bg-black/5 text-black"
              : "border-black/10 bg-white text-black/60 hover:border-black/25"
          }`}
        >
          Melhor avaliados
        </Link>
      </div>
    </div>
  );
}
