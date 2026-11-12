import type { BrandingConfig } from "@/modules/settings/schema";

interface MemberCardProps {
  name: string;
  branding: BrandingConfig;
  reviewsEnabled: boolean;
  /** Straightens the card while the visitor is typing their name. */
  isActive: boolean;
  compact?: boolean;
}

const CARD_ART = "/branding/hero-rede-1.webp";

// "nov. 2026": the month the account is being created, which is what the card
// will say once it exists. Nothing on the card claims more than that.
function sinceLabel(): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" })
    .format(new Date())
    .replace(" de ", " ");
}

/**
 * Preview of the account being created. Purely visual: the same name is in the
 * Nome field, so the card is hidden from assistive tech to avoid reading it twice.
 */
export function MemberCard({ name, branding, reviewsEnabled, isActive, compact = false }: MemberCardProps) {
  const shownName = name.trim() || "Seu nome";
  const isPlaceholder = !name.trim();

  return (
    <div
      aria-hidden
      className={`member-card relative isolate overflow-hidden text-white ${
        compact ? "aspect-[16/7] rounded-[calc(var(--radius)+8px)] p-5" : "aspect-[13/8] rounded-[calc(var(--radius)+14px)] p-8"
      } ${isActive ? "member-card--active" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={CARD_ART} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_50%]" />
      {/* The art is drawn in the default navy and gold. Re-colour it from the
          theme across the whole card, so a re-branded site gets a card in its
          own primary: the art keeps its light, the theme supplies the hue. */}
      <div className="absolute inset-0 -z-10 bg-[var(--color-primary)] opacity-60 mix-blend-color" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,color-mix(in_srgb,var(--color-primary)_72%,transparent),color-mix(in_srgb,var(--color-primary)_38%,transparent))]" />

      <div className="flex items-center gap-3">
        {branding.logoKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logoKey} alt="" className={compact ? "h-8 w-8 object-contain" : "h-10 w-10 object-contain"} />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[var(--color-accent)] text-sm font-bold">
            {branding.siteName.charAt(0)}
          </span>
        )}
        <span className={`font-semibold tracking-tight ${compact ? "text-sm" : "text-base"}`}>{branding.siteName}</span>
      </div>

      <div className={`absolute inset-x-0 ${compact ? "bottom-4 px-5" : "bottom-7 px-8"}`}>
        <p
          className={`truncate font-bold tracking-tight transition-opacity duration-200 ${
            compact ? "text-2xl" : "text-[2.15rem] leading-tight"
          } ${isPlaceholder ? "opacity-75" : "opacity-100"}`}
        >
          {shownName}
        </p>
        {!compact && (
          <div className="mt-4 flex gap-8 text-sm text-white/80">
            {/* The month comes from the clock, which can differ between the
                server render and hydration on the first day of a month. */}
            <p suppressHydrationWarning>
              <span className="block font-semibold text-white">Conta na rede</span>
              desde {sinceLabel()}
            </p>
            <p>
              <span className="block font-semibold text-white">Pode</span>
              {reviewsEnabled ? "avaliar e anunciar" : "anunciar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
