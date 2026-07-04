import Link from "next/link";
import { notFound } from "next/navigation";
import { listActiveCategories } from "@/modules/categories/service";
import { getListingById } from "@/modules/listings/service";
import { LISTING_STATUS, MAX_PHOTOS_PER_LISTING } from "@/lib/constants";
import { ListingForm } from "../ListingForm";
import { archiveListingAction, deletePhotoAction, uploadPhotoAction } from "../actions";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}

export default async function EditListingPage({ params, searchParams }: EditListingPageProps) {
  const [{ id }, { error, saved }] = await Promise.all([params, searchParams]);
  const [listing, categories] = await Promise.all([
    getListingById(id),
    listActiveCategories(),
  ]);
  if (!listing) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Editar anúncio</h1>
        {listing.status === LISTING_STATUS.PUBLISHED && (
          <Link
            href={`/p/${listing.slug}`}
            className="text-sm font-medium text-slate-600 hover:underline"
          >
            Ver no site →
          </Link>
        )}
      </div>

      <div className="mt-6">
        <ListingForm
          categories={categories}
          listing={listing}
          error={error}
          saved={saved === "1"}
        />
      </div>

      <section className="mt-10 max-w-2xl" aria-label="Fotos">
        <h2 className="text-lg font-semibold">
          Fotos ({listing.photos.length}/{MAX_PHOTOS_PER_LISTING})
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listing.photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-md border border-slate-200"
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

        {listing.photos.length < MAX_PHOTOS_PER_LISTING && (
          <form
            action={uploadPhotoAction}
            className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-dashed border-slate-300 bg-white p-4"
          >
            <input type="hidden" name="listingId" value={listing.id} />
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              required
              className="text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Enviar foto
            </button>
            <span className="text-xs text-slate-400">JPEG, PNG ou WebP · máx. 10 MB</span>
          </form>
        )}
      </section>

      {listing.status !== LISTING_STATUS.ARCHIVED && (
        <section className="mt-10 max-w-2xl rounded-md border border-red-200 bg-red-50/50 p-4">
          <h2 className="text-sm font-semibold text-red-800">Arquivar anúncio</h2>
          <p className="mt-1 text-sm text-red-700/80">
            O anúncio sai do site, mas o histórico de avaliações é preservado.
          </p>
          <form action={archiveListingAction} className="mt-3">
            <input type="hidden" name="id" value={listing.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Arquivar
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
