import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LISTING_STATUS, REVIEW_STATUS } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const [published, drafts, categories, users, reviews, hidden] = await Promise.all([
    prisma.listing.count({ where: { status: LISTING_STATUS.PUBLISHED } }),
    prisma.listing.count({ where: { status: LISTING_STATUS.DRAFT } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.review.count(),
    prisma.review.count({ where: { status: REVIEW_STATUS.HIDDEN } }),
  ]);

  const cards = [
    { label: "Anúncios publicados", value: published, href: "/admin/listings?status=PUBLISHED" },
    { label: "Categorias ativas", value: categories, href: "/admin/categories" },
    { label: "Usuários", value: users, href: "/admin/users" },
    { label: "Avaliações", value: reviews, href: "/admin/reviews" },
    { label: "Avaliações ocultas", value: hidden, href: "/admin/reviews" },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1>Visão geral</h1>
        <Link href="/admin/listings/new" className="text-sm font-semibold underline underline-offset-4">
          Novo anúncio
        </Link>
      </header>
      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-5">
        <div>
          <h2 className="text-lg font-semibold">Anúncios em análise</h2>
          <p className="text-sm text-slate-600">
            {drafts === 0 ? "Nenhum anúncio aguardando revisão." : drafts === 1 ? "1 anúncio aguardando revisão." : drafts + " anúncios aguardando revisão."}
          </p>
        </div>
        <Link href="/admin/listings?status=DRAFT" className="inline-flex rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          Abrir fila de revisão
        </Link>
      </section>
      <dl className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {cards.map(({ label, value, href }) => (
          <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-4 py-3">
            <dt><Link href={href} className="text-sm font-semibold underline-offset-4 hover:underline">{label}</Link></dt>
            <dd className="text-xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
