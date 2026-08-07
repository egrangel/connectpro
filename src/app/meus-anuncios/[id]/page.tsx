import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ListingForm } from "@/components/listings/ListingForm";
import { PhotoUploadForm } from "@/components/listings/PhotoUploadForm";
import { requireUser } from "@/lib/auth/session";
import { LISTING_STATUS } from "@/lib/constants";
import { listActiveCategories } from "@/modules/categories/service";
import { canManageListing } from "@/modules/listings/authorization";
import { deletePhotoAction } from "@/modules/listings/photo-actions";
import { getListingById } from "@/modules/listings/service";
import { getSiteFeatures } from "@/modules/settings/service";
import { saveOwnListingAction } from "../actions";

export const metadata: Metadata = { title: "Editar anúncio" };

interface EditOwnListingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}

export default async function EditOwnListingPage({
  params,
  searchParams,
}: EditOwnListingPageProps) {
  const [{ id }, { error, saved, created }, user] = await Promise.all([
    params,
    searchParams,
    requireUser(),
  ]);

  const [listing, categories, { maxPhotosPerListing }] = await Promise.all([
    getListingById(id),
    listActiveCategories(),
    getSiteFeatures(),
  ]);

  // Missing and not-yours are the same answer: no listing ids leak this way.
  if (!listing || !canManageListing(user, listing)) redirect("/meus-anuncios");

  const isJustCreated = created === "1";
  const isPublished = listing.status === LISTING_STATUS.PUBLISHED;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/meus-anuncios"
        className="text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-primary)]"
      >
        ← Meus anúncios
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">{listing.title}</h1>

      {isJustCreated && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-semibold">Anúncio enviado para análise.</p>
          <p className="mt-1 text-emerald-700">
            Ele ainda não aparece no site. Agora adicione as fotos — elas só podem
            ser enviadas depois que o anúncio existe.{" "}
            <a href="#fotos" className="font-semibold underline underline-offset-2">
              Ir para as fotos
            </a>
            .
          </p>
        </div>
      )}

      {isPublished && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Este anúncio está publicado. Se você editar os dados, ele volta para
          análise e sai do site até ser aprovado de novo.
        </p>
      )}

      <div className="mt-6">
        <ListingForm
          categories={categories}
          listing={listing}
          error={error}
          saved={saved === "1"}
          action={saveOwnListingAction}
          canChangeStatus={false}
        />
      </div>

      <section
        id="fotos"
        className={`mt-10 max-w-2xl scroll-mt-6 ${
          isJustCreated
            ? "rounded-lg ring-2 ring-emerald-300 ring-offset-4 ring-offset-[var(--color-surface)]"
            : ""
        }`}
        aria-label="Fotos"
      >
        <h2 className="text-lg font-semibold">
          Fotos ({listing.photos.length}/{maxPhotosPerListing})
        </h2>
        {listing.photos.length > maxPhotosPerListing && (
          <p className="mt-1 text-sm text-amber-700">
            As fotos existentes continuam no ar. Para enviar novas, remova algumas
            até ficar dentro do limite de {maxPhotosPerListing}.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listing.photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-md border border-[var(--color-line)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.storageKey}
                alt={photo.altText ?? ""}
                className="aspect-square w-full object-cover"
              />
              <form action={deletePhotoAction} className="absolute right-1.5 top-1.5">
                <input type="hidden" name="photoId" value={photo.id} />
                <button
                  type="submit"
                  aria-label="Excluir foto"
                  className="rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100"
                >
                  Excluir
                </button>
              </form>
            </div>
          ))}
        </div>

        {listing.photos.length < maxPhotosPerListing && (
          <PhotoUploadForm
            key={listing.photos.length}
            listingId={listing.id}
            remaining={maxPhotosPerListing - listing.photos.length}
          />
        )}
      </section>
    </div>
  );
}
