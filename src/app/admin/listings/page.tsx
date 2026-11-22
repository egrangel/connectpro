import Link from "next/link";
import { listAllListings } from "@/modules/listings/service";
import { LISTING_STATUS } from "@/lib/constants";

interface AdminListingsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  [LISTING_STATUS.DRAFT]: "Em análise",
  [LISTING_STATUS.PUBLISHED]: "Publicado",
  [LISTING_STATUS.ARCHIVED]: "Arquivado",
};

const STATUS_STYLES: Record<string, string> = {
  [LISTING_STATUS.DRAFT]: "bg-amber-100 text-amber-800",
  [LISTING_STATUS.PUBLISHED]: "bg-emerald-100 text-emerald-800",
  [LISTING_STATUS.ARCHIVED]: "bg-slate-200 text-slate-600",
};

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  const { status } = await searchParams;
  const validStatus = status && Object.hasOwn(STATUS_LABELS, status) ? status : undefined;
  const listings = await listAllListings(validStatus);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Anúncios</h1>
        <Link
          href="/admin/listings/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          + Novo anúncio
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/listings"
          className={`rounded-full px-3 py-1 ${!validStatus ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          Todos
        </Link>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/listings?status=${value}`}
            className={`rounded-full px-3 py-1 ${validStatus === value ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white admin-listing-table">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3">Fotos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-slate-50">
                <th scope="row" className="px-4 py-3 text-left font-medium text-slate-800">
                  <Link href={`/admin/listings/${listing.id}`} className="block break-words underline-offset-4 hover:underline">
                    {listing.title}
                    <span className="mt-1 block text-xs font-semibold underline">
                      {listing.status === LISTING_STATUS.DRAFT ? "Revisar anúncio" : "Editar anúncio"}
                    </span>
                  </Link>
                </th>
                <td className="px-4 py-3 text-slate-600" data-label="Categoria">{listing.category.name}</td>
                <td className="px-4 py-3" data-label="Status">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[listing.status] ?? ""}`}
                  >
                    {STATUS_LABELS[listing.status] ?? listing.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600" data-label="Nota">
                  {listing.ratingCount > 0
                    ? `${listing.ratingAvg.toFixed(1)} (${listing.ratingCount})`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600" data-label="Fotos">{listing.photos.length}</td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-600">
                  Nenhum anúncio encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
