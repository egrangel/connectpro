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
    { label: "Anúncios publicados", value: published, href: "/admin/listings" },
    { label: "Rascunhos", value: drafts, href: "/admin/listings?status=DRAFT" },
    { label: "Categorias ativas", value: categories, href: "/admin/categories" },
    { label: "Usuários", value: users, href: "/admin" },
    { label: "Avaliações", value: reviews, href: "/admin/reviews" },
    { label: "Avaliações ocultas", value: hidden, href: "/admin/reviews" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <p className="text-3xl font-bold text-slate-800">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.label}</p>
          </Link>
        ))}
      </div>
      <Link
        href="/admin/listings/new"
        className="mt-8 inline-block rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
      >
        + Novo anúncio
      </Link>
    </div>
  );
}
