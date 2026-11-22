import { MemberPage } from "@/components/site/MemberPage";
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
    <MemberPage
      title="Meus anúncios"
      description="Anúncios novos ou editados passam pela análise de um administrador antes de aparecerem no site."
      action={listings.length > 0 ? <Link href="/my-listings/new" className="site-button">Novo anúncio</Link> : null}
    >
      {listings.length === 0 ? (
        <div className="text-sm text-[var(--color-muted)]">
          <p className="font-bold text-[var(--color-text)]">Você ainda não tem anúncios.</p>
          <p className="mt-1 max-w-sm leading-6">
            Cadastre seu serviço com descrição, contatos e fotos. Ele vai para análise e aparece
            no site depois de aprovado.
          </p>
          <Link
            href="/my-listings/new"
            className="site-button mt-5"
          >
            Criar meu primeiro anúncio
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-line)]">
          {listings.map((listing) => {
            const badge = STATUS_LABEL[listing.status] ?? STATUS_LABEL[LISTING_STATUS.DRAFT];
            return (
              <li
                key={listing.id}
                className="py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/my-listings/${listing.id}`}
                      className="break-words font-bold hover:text-[var(--color-primary)] hover:underline"
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
    </MemberPage>
  );
}
