import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PhotoCarousel } from "@/components/listings/PhotoCarousel";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { StarRating } from "@/components/ui/StarRating";
import { instagramProfileUrl } from "@/modules/listings/instagram";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublishedListingBySlug } from "@/modules/listings/service";
import { getSiteFeatures } from "@/modules/settings/service";
import {
  getUserReviewForListing,
  getVisibleReviews,
} from "@/modules/reviews/service";

type VisibleReview = Awaited<ReturnType<typeof getVisibleReviews>>[number];

interface ListingPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reviewError?: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublishedListingBySlug(slug);
  if (!listing) return {};
  return {
    title: `${listing.title} - ${listing.category.name}`,
    description: listing.description.slice(0, 160),
  };
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-line)] bg-white/72 p-3">
      <span className="text-xs font-bold uppercase text-[var(--color-muted)]">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          className="mt-1 block break-words font-bold text-[var(--color-primary)] hover:underline"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : (
        <span className="mt-1 block font-bold">{value}</span>
      )}
    </div>
  );
}

export default async function ListingPage({ params, searchParams }: ListingPageProps) {
  const [{ slug }, { reviewError }] = await Promise.all([params, searchParams]);
  const listing = await getPublishedListingBySlug(slug);
  if (!listing) notFound();

  const [user, { reviewsEnabled }] = await Promise.all([
    getCurrentUser(),
    getSiteFeatures(),
  ]);
  // With the review system off, skip the queries entirely — nothing renders.
  const [reviews, ownReview] = await Promise.all([
    reviewsEnabled ? getVisibleReviews(listing.id) : Promise.resolve<VisibleReview[]>([]),
    reviewsEnabled && user
      ? getUserReviewForListing(listing.id, user.id)
      : Promise.resolve(null),
  ]);

  const whatsappDigits = listing.contactWhatsapp?.replace(/\D/g, "");

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <nav className="mb-5 text-sm font-semibold text-[var(--color-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary)]">Inicio</Link>
        {" / "}
        <Link href={`/?category=${listing.category.slug}#listagens`} className="hover:text-[var(--color-primary)]">
          {listing.category.name}
        </Link>
      </nav>

      <PhotoCarousel photos={listing.photos} title={listing.title} />

      <header className="card-surface mt-6 rounded-[calc(var(--radius)+8px)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
              {listing.category.name}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{listing.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
              {listing.city && <span className="font-semibold">{listing.city}</span>}
              {reviewsEnabled && (
                <span className="flex items-center gap-1.5 font-semibold">
                  <StarRating value={listing.ratingAvg} />
                  {listing.ratingCount > 0
                    ? `${listing.ratingAvg.toFixed(1)} - ${listing.ratingCount} ${
                        listing.ratingCount === 1 ? "avaliacao" : "avaliacoes"
                      }`
                    : "Sem avaliacoes ainda"}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        <section aria-label="Descricao" className="card-surface rounded-[calc(var(--radius)+8px)] p-5 sm:p-6">
          <h2 className="mb-3 text-lg font-bold tracking-tight">Sobre o profissional</h2>
          <p className="whitespace-pre-line leading-8 text-[var(--color-muted)]">
            {listing.description}
          </p>
        </section>

        <aside className="card-surface h-fit rounded-[calc(var(--radius)+8px)] p-5">
          <h2 className="mb-4 text-lg font-bold tracking-tight">Contato</h2>
          <div className="flex flex-col gap-3 text-sm">
            {whatsappDigits && (
              <ContactRow
                label="WhatsApp"
                value={listing.contactWhatsapp!}
                href={`https://wa.me/${whatsappDigits}`}
              />
            )}
            {listing.contactPhone && (
              <ContactRow
                label="Telefone"
                value={listing.contactPhone}
                href={`tel:${listing.contactPhone}`}
              />
            )}
            {listing.contactEmail && (
              <ContactRow
                label="E-mail"
                value={listing.contactEmail}
                href={`mailto:${listing.contactEmail}`}
              />
            )}
            {listing.instagram && (
              <a
                href={instagramProfileUrl(listing.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-[var(--radius)] border border-[var(--color-line)] bg-white/72 p-3 transition hover:border-[var(--color-primary)] hover:bg-white"
              >
                <InstagramIcon className="h-6 w-6 shrink-0 text-[var(--color-primary)]" />
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase text-[var(--color-muted)]">
                    Instagram
                  </span>
                  <span className="block truncate font-bold text-[var(--color-primary)] group-hover:underline">
                    {`@${listing.instagram}`}
                  </span>
                </span>
              </a>
            )}
            {listing.websiteUrl && (
              <ContactRow label="Site" value={listing.websiteUrl} href={listing.websiteUrl} />
            )}
            {!whatsappDigits &&
              !listing.contactPhone &&
              !listing.contactEmail &&
              !listing.instagram &&
              !listing.websiteUrl && (
                <p className="text-[var(--color-muted)]">Nenhum contato informado.</p>
              )}
          </div>
        </aside>
      </div>

      {reviewsEnabled && (
        <ReviewsSection
          listingId={listing.id}
          listingSlug={listing.slug}
          ratingAvg={listing.ratingAvg}
          ratingCount={listing.ratingCount}
          reviews={reviews}
          ownRating={ownReview?.rating ?? 0}
          ownComment={ownReview?.comment ?? ""}
          currentUserId={user?.id ?? null}
          error={reviewError}
        />
      )}
    </article>
  );
}
