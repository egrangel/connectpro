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

      <section id="listagens" className="mx-auto max-w-6xl px-4 py-10">
        <SearchFilters categories={categories} query={query} />

        <div className="mt-8 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {query.q ? `Resultados para “${query.q}”` : "Profissionais"}
          </h2>
          <span className="text-sm text-black/50">
            {results.total} {results.total === 1 ? "anúncio" : "anúncios"}
          </span>
        </div>

        {results.items.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius)] border border-dashed border-black/15 bg-white p-12 text-center text-black/55">
            <p className="font-medium">Nenhum profissional encontrado.</p>
            <p className="mt-1 text-sm">Tente outra busca ou remova os filtros.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {results.pageCount > 1 && (
          <nav
            aria-label="Paginação"
            className="mt-10 flex items-center justify-center gap-3 text-sm"
          >
            {results.page > 1 && (
              <Link
                href={pageHref(params, results.page - 1)}
                className="rounded-[var(--radius)] border border-black/10 bg-white px-4 py-2 font-medium hover:bg-black/5"
              >
                ← Anterior
              </Link>
            )}
            <span className="text-black/55">
              Página {results.page} de {results.pageCount}
            </span>
            {results.page < results.pageCount && (
              <Link
                href={pageHref(params, results.page + 1)}
                className="rounded-[var(--radius)] border border-black/10 bg-white px-4 py-2 font-medium hover:bg-black/5"
              >
                Próxima →
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
