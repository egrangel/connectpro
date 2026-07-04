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
    title: `${listing.title} — ${listing.category.name}`,
    description: listing.description.slice(0, 160),
  };
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium uppercase tracking-wide text-black/45">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          className="font-medium text-[var(--color-primary)] hover:underline"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : (
        <span className="font-medium">{value}</span>
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
    <article className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-4 text-sm text-black/50">
        <Link href="/" className="hover:underline">Início</Link>
        {" / "}
        <Link href={`/?category=${listing.category.slug}#listagens`} className="hover:underline">
          {listing.category.name}
        </Link>
      </nav>

      <PhotoCarousel photos={listing.photos} title={listing.title} />

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-black/60">
            <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 font-medium text-[var(--color-primary)]">
              {listing.category.name}
            </span>
            {listing.city && <span>{listing.city}</span>}
            <span className="flex items-center gap-1.5">
              <StarRating value={listing.ratingAvg} />
              {listing.ratingCount > 0
                ? `${listing.ratingAvg.toFixed(1)} · ${listing.ratingCount} ${
                    listing.ratingCount === 1 ? "avaliação" : "avaliações"
                  }`
                : "Sem avaliações ainda"}
            </span>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <section aria-label="Descrição">
          <p className="whitespace-pre-line leading-relaxed text-black/80">
            {listing.description}
          </p>
        </section>

        <aside className="h-fit rounded-[var(--radius)] border border-black/10 bg-white p-5">
          <h2 className="mb-4 font-semibold">Contato</h2>
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
              <p className="text-black/50">Nenhum contato informado.</p>
            )}
          </div>
        </aside>
      </div>

      <section id="avaliacoes" className="mt-12" aria-label="Avaliações">
        <h2 className="text-xl font-semibold tracking-tight">Avaliações</h2>

        {listing.ratingCount > 0 && (
          <div className="mt-4 flex flex-col gap-4 rounded-[var(--radius)] border border-black/10 bg-white p-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold">{listing.ratingAvg.toFixed(1)}</p>
              <StarRating value={listing.ratingAvg} size="md" />
              <p className="mt-1 text-xs text-black/50">{listing.ratingCount} avaliações</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const count = distribution[stars];
                const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-right text-black/60">{stars}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-black/50">{count}</span>
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
            <p className="rounded-[var(--radius)] border border-dashed border-black/15 bg-white p-5 text-sm text-black/60">
              <Link
                href={`/login?next=${encodeURIComponent(`/p/${listing.slug}`)}`}
                className="font-semibold text-[var(--color-primary)] hover:underline"
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
              className="rounded-[var(--radius)] border border-black/10 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{review.user.displayName}</span>
                  <StarRating value={review.rating} />
                </div>
                <div className="flex items-center gap-3 text-xs text-black/45">
                  <time dateTime={review.createdAt.toISOString()}>
                    {review.createdAt.toLocaleDateString("pt-BR")}
                  </time>
                  {user?.id === review.userId && (
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="listingSlug" value={listing.slug} />
                      <button type="submit" className="font-medium text-red-500 hover:underline">
                        Excluir
                      </button>
                    </form>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 whitespace-pre-line text-sm text-black/75">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
          {reviews.length === 0 && (
            <li className="text-sm text-black/50">
              Este profissional ainda não recebeu avaliações. Seja o primeiro!
            </li>
          )}
        </ul>
      </section>
    </article>
  );
}
