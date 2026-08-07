import Link from "next/link";
import { notFound } from "next/navigation";
import { listActiveCategories } from "@/modules/categories/service";
import { getListingById } from "@/modules/listings/service";
import { LISTING_STATUS, MAX_PHOTOS_PER_LISTING } from "@/lib/constants";
import { ListingForm } from "../ListingForm";
import { PhotoUploadForm } from "../PhotoUploadForm";
import { archiveListingAction, deletePhotoAction } from "../actions";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}

export default async function EditListingPage({ params, searchParams }: EditListingPageProps) {
  const [{ id }, { error, saved, created }] = await Promise.all([params, searchParams]);
  const isJustCreated = created === "1";
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

      {isJustCreated && (
        <div className="mt-4 max-w-2xl rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-semibold">Anúncio criado como rascunho.</p>
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

      <div className="mt-6">
        <ListingForm
          categories={categories}
          listing={listing}
          error={error}
          saved={saved === "1"}
        />
      </div>

      <section
        id="fotos"
        className={`mt-10 max-w-2xl scroll-mt-6 ${
          isJustCreated
            ? "rounded-lg ring-2 ring-emerald-300 ring-offset-4 ring-offset-slate-50"
            : ""
        }`}
        aria-label="Fotos"
      >
        <h2 className="text-lg font-semibold">
          Fotos ({listing.photos.length}/{MAX_PHOTOS_PER_LISTING})
        </h2>
        {isJustCreated && listing.photos.length === 0 && (
          <p className="mt-1 text-sm text-slate-500">
            Escolha as fotos abaixo. A primeira será a capa do anúncio.
          </p>
        )}
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
          <PhotoUploadForm
            // Remount after a successful upload/delete so the selected-files
            // feedback clears; a failed upload keeps the selection visible.
            key={listing.photos.length}
            listingId={listing.id}
            remaining={MAX_PHOTOS_PER_LISTING - listing.photos.length}
          />
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
