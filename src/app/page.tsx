import Link from "next/link";
import { HeroBanner } from "@/components/site/HeroBanner";
import { SearchFilters } from "@/components/search/SearchFilters";
import { ListingCard } from "@/components/listings/ListingCard";
import { listActiveCategories } from "@/modules/categories/service";
import { listingQuerySchema } from "@/modules/listings/schema";
import { searchPublishedListings } from "@/modules/listings/service";
import { getSiteConfig } from "@/modules/settings/service";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pageHref(
  params: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const next = new URLSearchParams();
  for (const key of ["q", "category", "sort"]) {
    const value = params[key];
    if (typeof value === "string" && value) next.set(key, value);
  }
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/?${qs}#listagens` : "/#listagens";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = listingQuerySchema.parse({
    q: typeof params.q === "string" ? params.q : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    sort: params.sort,
    page: params.page,
  });

  const [config, categories, results] = await Promise.all([
    getSiteConfig(),
    listActiveCategories(),
    searchPublishedListings(query),
  ]);

  return (
    <>
      <HeroBanner banner={config.banner} />

      <section id="listagens" className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <SearchFilters categories={categories} query={query} />

        <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--color-primary)]">
              Profissionais selecionados
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {query.q ? `Resultados para "${query.q}"` : "Encontre quem resolve"}
            </h2>
          </div>
          <span className="text-sm font-semibold text-[var(--color-muted)]">
            {results.total} {results.total === 1 ? "anuncio" : "anuncios"}
          </span>
        </div>

        {results.items.length === 0 ? (
          <div className="card-surface mt-8 rounded-[calc(var(--radius)+8px)] p-12 text-center text-[var(--color-muted)]">
            <p className="font-bold text-[var(--color-text)]">Nenhum profissional encontrado.</p>
            <p className="mt-1 text-sm">Tente outra busca ou remova os filtros.</p>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {results.pageCount > 1 && (
          <nav
            aria-label="Paginacao"
            className="mt-12 flex items-center justify-center gap-3 text-sm"
          >
            {results.page > 1 && (
              <Link
                href={pageHref(params, results.page - 1)}
                className="rounded-[var(--radius)] border border-[var(--color-line)] bg-white/80 px-4 py-2 font-bold transition hover:bg-white"
              >
                Anterior
              </Link>
            )}
            <span className="text-[var(--color-muted)]">
              Pagina {results.page} de {results.pageCount}
            </span>
            {results.page < results.pageCount && (
              <Link
                href={pageHref(params, results.page + 1)}
                className="rounded-[var(--radius)] border border-[var(--color-line)] bg-white/80 px-4 py-2 font-bold transition hover:bg-white"
              >
                Proxima
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}