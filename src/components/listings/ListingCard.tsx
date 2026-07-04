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
      className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.storageKey}
            alt={cover.altText ?? listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden
            className="grid h-full w-full place-items-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-4xl font-bold text-white/90"
          >
            {listing.title.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-[var(--color-text)] shadow-sm">
          {listing.category.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug group-hover:text-[var(--color-primary)]">
          {listing.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-black/60">
          <StarRating value={listing.ratingAvg} />
          {listing.ratingCount > 0 ? (
            <span>
              {listing.ratingAvg.toFixed(1)} ({listing.ratingCount})
            </span>
          ) : (
            <span>Sem avaliações</span>
          )}
        </div>
        <p className="line-clamp-3 text-sm text-black/70">{listing.description}</p>
        {listing.city && (
          <p className="mt-auto pt-1 text-xs font-medium uppercase tracking-wide text-black/45">
            {listing.city}
          </p>
        )}
      </div>
    </Link>
  );
}
