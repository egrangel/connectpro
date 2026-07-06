import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PhotoCarousel } from "@/components/listings/PhotoCarousel";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublishedListingBySlug } from "@/modules/listings/service";
import { computeRatingDistribution } from "@/modules/reviews/aggregate";
import { deleteReviewAction } from "@/modules/reviews/actions";
import {
  getUserReviewForListing,
  getVisibleReviews,
} from "@/modules/reviews/service";

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

  const user = await getCurrentUser();
  const [reviews, ownReview] = await Promise.all([
    getVisibleReviews(listing.id),
    user ? getUserReviewForListing(listing.id, user.id) : Promise.resolve(null),
  ]);
  const distribution = computeRatingDistribution(reviews.map((r) => r.rating));

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
              <span className="flex items-center gap-1.5 font-semibold">
                <StarRating value={listing.ratingAvg} />
                {listing.ratingCount > 0
                  ? `${listing.ratingAvg.toFixed(1)} - ${listing.ratingCount} ${
                      listing.ratingCount === 1 ? "avaliacao" : "avaliacoes"
                    }`
                  : "Sem avaliacoes ainda"}
              </span>
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
            {listing.websiteUrl && (
              <ContactRow label="Site" value={listing.websiteUrl} href={listing.websiteUrl} />
            )}
            {!whatsappDigits && !listing.contactPhone && !listing.contactEmail && !listing.websiteUrl && (
              <p className="text-[var(--color-muted)]">Nenhum contato informado.</p>
            )}
          </div>
        </aside>
      </div>

      <section id="avaliacoes" className="mt-12" aria-label="Avaliacoes">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--color-primary)]">Experiencias</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Avaliacoes</h2>
          </div>
        </div>

        {listing.ratingCount > 0 && (
          <div className="card-surface mt-5 flex flex-col gap-5 rounded-[calc(var(--radius)+8px)] p-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="text-center sm:w-36">
              <p className="text-5xl font-bold">{listing.ratingAvg.toFixed(1)}</p>
              <StarRating value={listing.ratingAvg} size="md" />
              <p className="mt-1 text-xs text-[var(--color-muted)]">{listing.ratingCount} avaliacoes</p>
            </div>
            <div className="flex-1 space-y-2">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const count = distribution[stars];
                const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-right text-[var(--color-muted)]">{stars}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_10%,white)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-[var(--color-muted)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          {user ? (
            <ReviewForm
              listingId={listing.id}
              listingSlug={listing.slug}
              initialRating={ownReview?.rating ?? 0}
              initialComment={ownReview?.comment ?? ""}
              error={reviewError}
            />
          ) : (
            <p className="card-surface rounded-[calc(var(--radius)+8px)] p-5 text-sm text-[var(--color-muted)]">
              <Link
                href={`/login?next=${encodeURIComponent(`/p/${listing.slug}`)}`}
                className="font-bold text-[var(--color-primary)] hover:underline"
              >
                Entre na sua conta
              </Link>{" "}
              para avaliar este profissional.
            </p>
          )}
        </div>

        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="card-surface rounded-[calc(var(--radius)+8px)] p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold">{review.user.displayName}</span>
                  <StarRating value={review.rating} />
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                  <time dateTime={review.createdAt.toISOString()}>
                    {review.createdAt.toLocaleDateString("pt-BR")}
                  </time>
                  {user?.id === review.userId && (
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="listingSlug" value={listing.slug} />
                      <button type="submit" className="font-bold text-red-600 hover:underline">
                        Excluir
                      </button>
                    </form>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--color-muted)]">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
          {reviews.length === 0 && (
            <li className="text-sm text-[var(--color-muted)]">
              Este profissional ainda nao recebeu avaliacoes. Seja o primeiro!
            </li>
          )}
        </ul>
      </section>
    </article>
  );
}