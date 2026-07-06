import Link from "next/link";
import { StarRating } from "@/components/ui/StarRating";
import type { PublicListing } from "@/modules/listings/service";

interface ListingCardProps {
  listing: PublicListing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const cover = listing.photos[0];
  return (
    <Link
      href={`/p/${listing.slug}`}
      className="group card-surface flex min-h-full flex-col overflow-hidden rounded-[calc(var(--radius)+6px)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[color-mix(in_srgb,var(--color-primary)_9%,white)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.storageKey}
            alt={cover.altText ?? listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden
            className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_92%,black),color-mix(in_srgb,var(--color-accent)_82%,white))] text-5xl font-bold text-white/92"
          >
            {listing.title.charAt(0).toUpperCase()}
          </div>
        )}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/42 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/92 px-3 py-1 text-xs font-bold text-[var(--color-primary)] shadow-sm backdrop-blur">
          {listing.category.name}
        </span>
        {listing.city && (
          <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/44 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {listing.city}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold leading-snug tracking-tight group-hover:text-[var(--color-primary)]">
          {listing.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <StarRating value={listing.ratingAvg} />
          {listing.ratingCount > 0 ? (
            <span className="font-semibold">
              {listing.ratingAvg.toFixed(1)} ({listing.ratingCount})
            </span>
          ) : (
            <span>Sem avaliacoes</span>
          )}
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-[var(--color-muted)]">{listing.description}</p>
        <span className="mt-auto inline-flex items-center text-sm font-bold text-[var(--color-primary)]">
          Ver profissional
        </span>
      </div>
    </Link>
  );
}