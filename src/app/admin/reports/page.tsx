import Link from "next/link";
import { SEARCH_REPORT_PAGE_SIZE } from "@/lib/constants";
import { getSearchTermsReport } from "@/modules/reports/service";

export default async function AdminReportsPage() {
  const { rows, distinctTerms, totalHits } = await getSearchTermsReport();
  const topCount = rows[0]?.count ?? 0;

  const summary = [
    { label: "Buscas registradas", value: totalHits },
    { label: "Termos diferentes", value: distinctTerms },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
      <p className="mt-1 text-sm text-slate-500">
        O que o público procura no site. Use para decidir quais categorias e
        anúncios priorizar.
      </p>

      <section className="mt-8" aria-labelledby="termos-mais-buscados">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="termos-mais-buscados" className="text-lg font-semibold text-slate-800">
              Termos mais buscados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Cada palavra digitada na busca conta uma vez por pesquisa
              {rows.length >= SEARCH_REPORT_PAGE_SIZE
                ? ` — exibindo os ${SEARCH_REPORT_PAGE_SIZE} primeiros.`
                : "."}
            </p>
          </div>
          <div className="flex gap-3">
            {summary.map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center"
              >
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{card.label}</p>
              </div>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nenhuma busca registrada ainda. Assim que alguém pesquisar no site, os
            termos aparecem aqui.
          </p>
        ) : (
          <ol className="mt-5 space-y-2">
            {rows.map((row, index) => (
              <li
                key={row.term}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-400">
                    {index + 1}
                  </span>
                  <Link
                    href={`/?q=${encodeURIComponent(row.term)}#listagens`}
                    className="min-w-0 flex-1 truncate font-medium text-slate-800 hover:text-slate-950 hover:underline"
                    title={`Ver resultados para "${row.term}"`}
                  >
                    {row.term}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                    {row.count}
                  </span>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">
                    {row.updatedAt.toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div
                  aria-hidden
                  className="ml-9 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    className="h-full rounded-full bg-slate-700"
                    style={{ width: `${topCount > 0 ? (row.count / topCount) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
