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
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface)_84%,white)]/90 shadow-[0_8px_28px_color-mix(in_srgb,var(--color-text)_6%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold tracking-tight">
          {branding.logoKey ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoKey}
              alt={branding.siteName}
              className="h-11 w-auto max-w-42 object-contain sm:max-w-52"
            />
          ) : (
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius)] bg-[var(--color-primary)] text-sm font-bold text-white shadow-[0_10px_22px_color-mix(in_srgb,var(--color-primary)_24%,transparent)]"
            >
              {branding.siteName.charAt(0)}
            </span>
          )}
          {!branding.logoKey && <span className="truncate text-lg">{branding.siteName}</span>}
        </Link>

        <nav className="flex shrink-0 items-center gap-1 text-sm">
          {user?.role === ROLES.ADMIN && (
            <Link
              href="/admin"
              className="rounded-[var(--radius)] px-3 py-2 font-semibold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,white)]"
            >
              Painel admin
            </Link>
          )}
          {user ? (
            <form action={logoutAction} className="flex items-center gap-3">
              <span className="hidden text-[var(--color-muted)] sm:inline">
                Ola, {user.displayName.split(" ")[0]}
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
                className="rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95"
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