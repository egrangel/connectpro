import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Painel administrativo" };

const NAV_ITEMS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/listings", label: "Anúncios" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/reviews", label: "Avaliações" },
  { href: "/admin/settings", label: "Aparência" },
] as const;

// Admin UI is deliberately not themed by site settings: a broken theme must
// never break the tool used to fix it.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="shrink-0 md:w-52">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Administração
        </p>
        <p className="mb-4 truncate text-sm text-slate-500">{admin.email}</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
