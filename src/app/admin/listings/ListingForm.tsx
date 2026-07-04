import type { Category, Listing } from "@prisma/client";
import { LISTING_STATUS } from "@/lib/constants";
import { saveListingAction } from "./actions";

interface ListingFormProps {
  categories: Category[];
  listing?: Listing;
  error?: string;
  saved?: boolean;
}

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export function ListingForm({ categories, listing, error, saved }: ListingFormProps) {
  return (
    <form action={saveListingAction} className="flex max-w-2xl flex-col gap-4">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      {saved && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Anúncio salvo com sucesso.
        </p>
      )}
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Título *
        <input
          type="text"
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={listing?.title ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Descrição *
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          defaultValue={listing?.description ?? ""}
          className={`${inputClass} resize-y`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Categoria *
          <select
            name="categoryId"
            required
            defaultValue={listing?.categoryId ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Selecione…
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Cidade
          <input
            type="text"
            name="city"
            maxLength={80}
            defaultValue={listing?.city ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          WhatsApp
          <input
            type="text"
            name="contactWhatsapp"
            maxLength={30}
            placeholder="+55 11 99999-0000"
            defaultValue={listing?.contactWhatsapp ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Telefone
          <input
            type="text"
            name="contactPhone"
            maxLength={30}
            defaultValue={listing?.contactPhone ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          E-mail de contato
          <input
            type="email"
            name="contactEmail"
            defaultValue={listing?.contactEmail ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Site
          <input
            type="url"
            name="websiteUrl"
            placeholder="https://…"
            defaultValue={listing?.websiteUrl ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Status *
        <select
          name="status"
          required
          defaultValue={listing?.status ?? LISTING_STATUS.DRAFT}
          className={inputClass}
        >
          <option value={LISTING_STATUS.DRAFT}>Rascunho (não aparece no site)</option>
          <option value={LISTING_STATUS.PUBLISHED}>Publicado</option>
          <option value={LISTING_STATUS.ARCHIVED}>Arquivado</option>
        </select>
      </label>

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          {listing ? "Salvar alterações" : "Criar anúncio"}
        </button>
      </div>
    </form>
  );
}
