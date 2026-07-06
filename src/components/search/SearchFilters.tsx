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
    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition";

  return (
    <div className="card-surface rounded-[calc(var(--radius)+8px)] p-3 sm:p-4">
      <form action="/#listagens" method="get" className="grid gap-3 sm:grid-cols-[1fr_auto]">
        {query.category && <input type="hidden" name="category" value={query.category} />}
        {query.sort !== "recent" && <input type="hidden" name="sort" value={query.sort} />}
        <label className="sr-only" htmlFor="search-listings">Buscar profissionais</label>
        <input
          id="search-listings"
          type="search"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Buscar por servico, nome ou descricao"
          className="min-h-12 w-full rounded-[var(--radius)] border border-[var(--color-line)] bg-white/86 px-4 text-sm shadow-inner outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
        />
        <button
          type="submit"
          className="min-h-12 rounded-[var(--radius)] bg-[var(--color-primary)] px-6 text-sm font-bold text-white shadow-[0_12px_28px_color-mix(in_srgb,var(--color-primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95"
        >
          Buscar
        </button>
      </form>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href={buildHref(query, { category: undefined })}
          className={`${chipBase} ${
            !query.category
              ? "border-transparent bg-[var(--color-primary)] text-white shadow-sm"
              : "border-[var(--color-line)] bg-white/70 text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-text)]"
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
                  ? "border-transparent bg-[var(--color-primary)] text-white shadow-sm"
                  : "border-[var(--color-line)] bg-white/70 text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-text)]"
              }`}
            >
              {category.name}
            </Link>
          );
        })}

        <span className="mx-2 h-6 w-px shrink-0 bg-[var(--color-line)]" aria-hidden />
        <Link
          href={buildHref(query, { sort: "recent" })}
          className={`${chipBase} ${
            query.sort === "recent"
              ? "border-[color-mix(in_srgb,var(--color-accent)_55%,white)] bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] text-[var(--color-text)]"
              : "border-[var(--color-line)] bg-white/70 text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-text)]"
          }`}
        >
          Recentes
        </Link>
        <Link
          href={buildHref(query, { sort: "rating" })}
          className={`${chipBase} ${
            query.sort === "rating"
              ? "border-[color-mix(in_srgb,var(--color-accent)_55%,white)] bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] text-[var(--color-text)]"
              : "border-[var(--color-line)] bg-white/70 text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-text)]"
          }`}
        >
          Melhor avaliados
        </Link>
      </div>
    </div>
  );
}