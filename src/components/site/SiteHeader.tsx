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
    <header className="site-header">
      <div className="site-frame site-header-inner">
        <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold tracking-tight">
          {branding.logoKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoKey}
              alt=""
              className="h-10 w-auto max-w-24 object-contain sm:max-w-42"
            />
          ) : (
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius)] bg-[var(--color-primary)] text-sm font-bold text-white shadow-[0_10px_22px_color-mix(in_srgb,var(--color-primary)_24%,transparent)]"
            >
              {branding.siteName.charAt(0)}
            </span>
          )}
          {/* An emblem alone doesn't say whose site this is; the name does. */}
          <span className={`truncate text-lg ${branding.logoKey ? "sr-only sm:not-sr-only" : ""}`}>
            {branding.siteName}
          </span>
        </Link>

        <nav className="site-nav" aria-label="Navegação principal">
          {user?.role === ROLES.ADMIN && (
            <Link
              href="/admin"
              className="rounded-[var(--radius)] px-3 py-2 font-semibold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]"
            >
              Administração
            </Link>
          )}
          {user && (
            <Link
              href="/my-listings"
              className="rounded-[var(--radius)] px-3 py-2 font-semibold transition hover:bg-white/70"
            >
              Meus anúncios
            </Link>
          )}
          {user ? (
            <form action={logoutAction} className="flex items-center gap-3">
              <span className="hidden text-[var(--color-muted)] sm:inline">
                Olá, {user.displayName.split(" ")[0]}
              </span>
              <button
                type="submit"
                className="rounded-[var(--radius)] border border-[var(--color-line)] bg-white/70 px-3 py-2 font-semibold transition hover:bg-white"
              >
                Sair
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-[var(--radius)] px-3 py-2 font-semibold transition hover:bg-white/70"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="site-button"
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