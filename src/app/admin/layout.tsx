import Link from "next/link";
import { AdminNav } from "./AdminNav";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Painel administrativo" };

const NAV_ITEMS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/listings", label: "Anúncios" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/reviews", label: "Avaliações" },
  { href: "/admin/users", label: "Usuários" },
  { href: "/admin/reports", label: "Relatórios" },
  { href: "/admin/settings", label: "Configurações" },
] as const;

// Admin UI is deliberately not themed by site settings: a broken theme must
// never break the tool used to fix it.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();

  return (
    <div className="admin-workspace">
      <aside className="admin-rail">
        <div className="mb-5">
          <p className="text-lg font-semibold">Administração</p>
          <p className="mt-1 break-all text-xs text-slate-300">{admin.email}</p>
        </div>
        <AdminNav items={NAV_ITEMS} />
        <Link href="/" className="mt-5 inline-block text-sm text-slate-200 underline underline-offset-4">
          Voltar ao diretório
        </Link>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
