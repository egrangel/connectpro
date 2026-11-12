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
export function SearchFilters({
  categories,
  query,
}: SearchFiltersProps) {
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
          placeholder="Buscar serviço, nome ou cidade"
          className="min-h-12 w-full rounded-[var(--radius)] border border-[var(--color-line)] bg-white/86 px-4 text-sm shadow-inner outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
        />
        <button
          type="submit"
          className="min-h-12 rounded-[var(--radius)] bg-[var(--color-primary)] px-6 text-sm font-bold text-white shadow-[0_12px_28px_color-mix(in_srgb,var(--color-primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95"
        >
          Buscar
        </button>
      </form>

      {/* Phones scroll the chips sideways; wider screens wrap them so no
          category hides past the edge. */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
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
      </div>
    </div>
  );
}

interface SortOptionsProps {
  query: ListingQuery;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Recentes" },
  { value: "rating", label: "Melhor avaliados" },
] as const;

/** Sort order next to the result count. Render only when reviews are on:
 *  without ratings, "Recentes" is the only order left. */
export function SortOptions({ query }: SortOptionsProps) {
  return (
    <nav aria-label="Ordenar anúncios" className="flex items-center gap-1 text-sm">
      <span className="mr-1 text-[var(--color-muted)]">Ordenar:</span>
      {SORT_OPTIONS.map((option) => {
        const isActive = query.sort === option.value;
        return (
          <Link
            key={option.value}
            href={buildHref(query, { sort: option.value })}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-3 py-1.5 font-semibold transition ${
              isActive
                ? "bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] text-[var(--color-text)]"
                : "text-[var(--color-muted)] hover:bg-white hover:text-[var(--color-text)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}