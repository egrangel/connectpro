import type { BrandingConfig } from "@/modules/settings/schema";

interface SiteFooterProps {
  branding: BrandingConfig;
}

export function SiteFooter({ branding }: SiteFooterProps) {
  return (
    <footer className="mt-20 border-t border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-[var(--color-muted)] sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-base font-bold text-[var(--color-text)]">{branding.siteName}</p>
          {branding.footerText && <p className="mt-2 max-w-2xl leading-6">{branding.footerText}</p>}
          <p className="mt-4 max-w-2xl text-xs leading-5">
            Este aplicativo pertence a Rede Connect UPP - {" "}
            <a
              href="https://www.iprmaringa.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              1a Igreja Presbiteriana Renovada (IPR) de Maringa-PR
            </a>
            .
          </p>
        </div>
        <nav aria-label="Redes da igreja" className="flex gap-3 text-xs font-semibold">
          <a
            href="https://www.iprmaringa.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--color-line)] bg-white/70 px-3 py-2 text-[var(--color-primary)] transition hover:bg-white"
          >
            Site da igreja
          </a>
          <a
            href="https://www.instagram.com/rede.connectupp/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--color-line)] bg-white/70 px-3 py-2 text-[var(--color-primary)] transition hover:bg-white"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}