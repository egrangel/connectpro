import type { BannerConfig } from "@/modules/settings/schema";

interface HeroBannerProps {
  banner: BannerConfig;
}

export function HeroBanner({ banner }: HeroBannerProps) {
  if (!banner.enabled) return null;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[var(--color-primary)] text-white"
    >
      {banner.imageKey && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageKey}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
      )}
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h1
          id="hero-heading"
          className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
        >
          {banner.headline}
        </h1>
        {banner.subheadline && (
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            {banner.subheadline}
          </p>
        )}
        {banner.ctaText && (
          <a
            href={banner.ctaUrl || "#listagens"}
            className="mt-8 inline-block rounded-[var(--radius)] bg-[var(--color-accent)] px-6 py-3 font-semibold text-black/85 shadow-lg transition hover:opacity-90"
          >
            {banner.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
