import { prisma } from "@/lib/prisma";
import { SEARCH_REPORT_PAGE_SIZE } from "@/lib/constants";
import { recordableTerms } from "./terms";

export interface SearchTermRow {
  term: string;
  count: number;
  updatedAt: Date;
}

export interface SearchTermsReport {
  rows: SearchTermRow[];
  distinctTerms: number;
  totalHits: number;
}

/**
 * Increments the counter of every term in a public search.
 *
 * Called from `after()` so it never delays the response, and failures are
 * logged instead of thrown: a broken analytics write must not take the home
 * page down with it.
 */
export async function recordSearchTerms(terms: readonly string[]): Promise<void> {
  const unique = recordableTerms(terms);
  if (unique.length === 0) return;

  try {
    await prisma.$transaction(
      unique.map((term) =>
        prisma.searchTermStat.upsert({
          where: { term },
          create: { term, count: 1 },
          update: { count: { increment: 1 } },
        }),
      ),
    );
  } catch (error) {
    console.error("[reports] falha ao registrar termos de busca", {
      terms: unique,
      error,
    });
  }
}

/** Most searched terms, ranked by hits then alphabetically for stable ties. */
export async function getSearchTermsReport(
  limit: number = SEARCH_REPORT_PAGE_SIZE,
): Promise<SearchTermsReport> {
  const [rows, distinctTerms, totals] = await Promise.all([
    prisma.searchTermStat.findMany({
      orderBy: [{ count: "desc" }, { term: "asc" }],
      take: limit,
      select: { term: true, count: true, updatedAt: true },
    }),
    prisma.searchTermStat.count(),
    prisma.searchTermStat.aggregate({ _sum: { count: true } }),
  ]);

  return {
    rows,
    distinctTerms,
    totalHits: totals._sum.count ?? 0,
  };
}
