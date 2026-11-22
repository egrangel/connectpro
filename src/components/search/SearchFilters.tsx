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
export function DirectorySearch({ query }: Pick<SearchFiltersProps, "query">) {

  return (
    <form action="/#listagens" method="get" role="search" className="directory-search">
        {query.category && <input type="hidden" name="category" value={query.category} />}
        {query.sort !== "recent" && <input type="hidden" name="sort" value={query.sort} />}
        <label className="sr-only" htmlFor="search-listings">Buscar profissionais</label>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" />
        </svg>
        <input
          id="search-listings"
          type="search"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Serviço, nome ou cidade"
        />
        <button
          type="submit"
          className="site-button"
        >
          Buscar
        </button>
    </form>
  );
}

export function DirectoryCategories({ categories, query }: SearchFiltersProps) {
  const firstCategories = categories.slice(0, 3);
  const activeCategory = categories.find((category) => category.slug === query.category);
  if (activeCategory && !firstCategories.includes(activeCategory)) firstCategories.push(activeCategory);
  const remaining = categories.filter((category) => !firstCategories.includes(category));

  const categoryLink = (category: Category) => {
    const selected = category.slug === query.category;
    return (
      <li key={category.id}>
        <Link href={buildHref(query, { category: selected ? undefined : category.slug })} aria-current={selected ? "true" : undefined}>
          {category.name}
        </Link>
      </li>
    );
  };

  return (
    <nav className="directory-categories" aria-labelledby="category-heading">
      <h2 id="category-heading">Categorias</h2>
      <ul>
        <li>
          <Link href={buildHref(query, { category: undefined })} aria-current={!query.category ? "true" : undefined}>
            Todas as categorias
          </Link>
        </li>
        {firstCategories.map(categoryLink)}
      </ul>
      {remaining.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer py-2 text-sm font-semibold">Mais categorias ({remaining.length})</summary>
          <ul>{remaining.map(categoryLink)}</ul>
        </details>
      )}
    </nav>
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