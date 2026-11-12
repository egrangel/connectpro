import Link from "next/link";
import { after } from "next/server";
import { HeroBanner } from "@/components/site/HeroBanner";
import { SearchFilters, SortOptions } from "@/components/search/SearchFilters";
import { ListingCard } from "@/components/listings/ListingCard";
import { searchTerms } from "@/lib/text";
import { listActiveCategories } from "@/modules/categories/service";
import { listingQuerySchema } from "@/modules/listings/schema";
import { searchPublishedListings } from "@/modules/listings/service";
import { recordSearchTerms } from "@/modules/reports/service";
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

interface EmptyResultsProps {
  query?: string;
  isFiltered: boolean;
}

const emptyLinkClass =
  "mt-5 inline-flex rounded-[var(--radius)] border border-[var(--color-line)] bg-white/80 px-4 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:bg-white";

// Three different situations share this slot: the directory has nothing
// published yet, a search matched nothing, or a category is still empty.
// Each gets its own message and the one action that moves the visitor on.
function EmptyResults({ query, isFiltered }: EmptyResultsProps) {
  const seeAll = { href: "/#listagens", label: "Ver todos os profissionais" };
  const { title, hint, action } = !isFiltered
    ? {
        title: "Ainda não há profissionais publicados.",
        hint: "Presta algum serviço? Crie sua conta e cadastre seu anúncio. Ele aparece aqui depois de aprovado.",
        action: { href: "/register", label: "Criar conta e anunciar" },
      }
    : query
      ? {
          title: `Nada encontrado para “${query}”.`,
          hint: "Confira a grafia ou busque pelo nome do serviço, como “eletricista” ou “aulas”.",
          action: seeAll,
        }
      : {
          title: "Ainda não há profissionais nesta categoria.",
          hint: "Veja os profissionais das outras categorias.",
          action: seeAll,
        };

  return (
    <div className="card-surface mt-8 rounded-[calc(var(--radius)+8px)] p-12 text-center text-[var(--color-muted)]">
      <p className="font-bold text-[var(--color-text)]">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6">{hint}</p>
      <Link href={action.href} className={emptyLinkClass}>
        {action.label}
      </Link>
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = listingQuerySchema.parse({
    q: typeof params.q === "string" ? params.q : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    sort: params.sort,
    page: params.page,
  });

  // Search report (admin). Counted on page 1 only, so paging through results
  // does not inflate a term, and after the response so it never delays it.
  if (query.q && query.page === 1) {
    const terms = searchTerms(query.q);
    after(() => recordSearchTerms(terms));
  }

  const [config, categories, results] = await Promise.all([
    getSiteConfig(),
    listActiveCategories(),
    searchPublishedListings(query),
  ]);

  const { reviewsEnabled } = config.features;

  return (
    <>
      <HeroBanner banner={config.banner} />

      <section id="listagens" className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <SearchFilters categories={categories} query={query} />

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {query.q ? `Resultados para “${query.q}”` : "Encontre quem resolve"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[var(--color-muted)]">
              {results.total} {results.total === 1 ? "anúncio" : "anúncios"}
            </p>
          </div>
          {reviewsEnabled && results.total > 1 && <SortOptions query={query} />}
        </div>

        {results.items.length === 0 ? (
          <EmptyResults query={query.q} isFiltered={Boolean(query.q || query.category)} />
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showRating={reviewsEnabled}
              />
            ))}
          </div>
        )}

        {results.pageCount > 1 && (
          <nav
            aria-label="Paginação"
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
              Página {results.page} de {results.pageCount}
            </span>
            {results.page < results.pageCount && (
              <Link
                href={pageHref(params, results.page + 1)}
                className="rounded-[var(--radius)] border border-[var(--color-line)] bg-white/80 px-4 py-2 font-bold transition hover:bg-white"
              >
                Próxima
              </Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}