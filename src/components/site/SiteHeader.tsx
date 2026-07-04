import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import { ROLES } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth/session";
import type { BrandingConfig } from "@/modules/settings/schema";

interface SiteHeaderProps {
  branding: BrandingConfig;
  user: SessionUser | null;
}

export function SiteHeader({ branding, user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          {branding.logoKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoKey}
              alt={branding.siteName}
              className="h-9 w-9 rounded-[var(--radius)] object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-[var(--radius)] bg-[var(--color-primary)] text-sm font-bold text-white"
            >
              {branding.siteName.charAt(0)}
            </span>
          )}
          <span className="text-lg">{branding.siteName}</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {user?.role === ROLES.ADMIN && (
            <Link
              href="/admin"
              className="rounded-[var(--radius)] px-3 py-2 font-medium text-[var(--color-primary)] hover:bg-black/5"
            >
              Painel admin
            </Link>
          )}
          {user ? (
            <form action={logoutAction} className="flex items-center gap-3">
              <span className="hidden text-black/60 sm:inline">
                Olá, {user.displayName.split(" ")[0]}
              </span>
              <button
                type="submit"
                className="rounded-[var(--radius)] border border-black/10 px-3 py-2 font-medium hover:bg-black/5"
              >
                Sair
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-[var(--radius)] px-3 py-2 font-medium hover:bg-black/5"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-2 font-medium text-white transition hover:opacity-90"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
