import Link from "next/link";
import { listAllListings } from "@/modules/listings/service";
import { LISTING_STATUS } from "@/lib/constants";

interface AdminListingsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  [LISTING_STATUS.DRAFT]: "Rascunho",
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
  const validStatus = status && status in STATUS_LABELS ? status : undefined;
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

      <div className="mt-4 flex gap-2 text-sm">
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

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3">Fotos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{listing.title}</td>
                <td className="px-4 py-3 text-slate-600">{listing.category.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[listing.status] ?? ""}`}
                  >
                    {STATUS_LABELS[listing.status] ?? listing.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {listing.ratingCount > 0
                    ? `${listing.ratingAvg.toFixed(1)} (${listing.ratingCount})`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{listing.photos.length}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/listings/${listing.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
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
