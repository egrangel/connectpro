import Link from "next/link";
import { StarRating } from "@/components/ui/StarRating";
import type { PublicListing } from "@/modules/listings/service";

interface ListingCardProps {
  listing: PublicListing;
  /** Hidden when the admin turns the review system off (Configurações). */
  showRating?: boolean;
}

export function ListingCard({ listing, showRating = true }: ListingCardProps) {
  const cover = listing.photos[0];
  return (
    <Link href={`/p/${listing.slug}`} className="listing-preview">
      {cover && (
        <div className="listing-preview-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.storageKey} alt={cover.altText ?? ""} loading="lazy" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 py-3">
        <p className="text-sm text-[var(--color-muted)]">
          {listing.category.name}{listing.city && ` · ${listing.city}`}
        </p>
        <h3>{listing.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">{listing.description}</p>
        {showRating && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            {listing.ratingCount > 0 ? (
              <>
                <StarRating value={listing.ratingAvg} />
                <span className="font-semibold">{listing.ratingAvg.toFixed(1)} ({listing.ratingCount})</span>
              </>
            ) : "Sem avaliações"}
          </div>
        )}
      </div>
    </Link>
  );
}
