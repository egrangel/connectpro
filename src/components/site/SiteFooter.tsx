import type { BrandingConfig } from "@/modules/settings/schema";

interface SiteFooterProps {
  branding: BrandingConfig;
}

export function SiteFooter({ branding }: SiteFooterProps) {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-black/60">
        <p className="font-medium text-[var(--color-text)]">{branding.siteName}</p>
        {branding.footerText && <p>{branding.footerText}</p>}
      </div>
    </footer>
  );
}
