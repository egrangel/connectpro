import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { LISTING_STATUS } from "@/lib/constants";
import { listListingsByOwner } from "@/modules/listings/service";

export const metadata: Metadata = { title: "Meus anúncios" };

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  [LISTING_STATUS.DRAFT]: {
    text: "Em análise",
    className: "bg-amber-100 text-amber-800",
  },
  [LISTING_STATUS.PUBLISHED]: {
    text: "Publicado",
    className: "bg-emerald-100 text-emerald-800",
  },
  [LISTING_STATUS.ARCHIVED]: {
    text: "Arquivado",
    className: "bg-slate-200 text-slate-700",
  },
};

export default async function MyListingsPage() {
  const user = await requireUser();
  const listings = await listListingsByOwner(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus anúncios</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Novos anúncios passam por análise antes de aparecerem no site.
          </p>
        </div>
        <Link
          href="/my-listings/new"
          className="rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-95"
        >
          + Novo anúncio
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="card-surface mt-8 rounded-[calc(var(--radius)+8px)] p-10 text-center text-sm text-[var(--color-muted)]">
          Você ainda não criou nenhum anúncio.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {listings.map((listing) => {
            const badge = STATUS_LABEL[listing.status] ?? STATUS_LABEL[LISTING_STATUS.DRAFT];
            return (
              <li
                key={listing.id}
                className="card-surface rounded-[calc(var(--radius)+8px)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/my-listings/${listing.id}`}
                      className="font-bold hover:text-[var(--color-primary)] hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                      {listing.category.name} · {listing.photos.length}{" "}
                      {listing.photos.length === 1 ? "foto" : "fotos"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}
                    >
                      {badge.text}
                    </span>
                    {listing.status === LISTING_STATUS.PUBLISHED && (
                      <Link
                        href={`/p/${listing.slug}`}
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        Ver no site →
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
