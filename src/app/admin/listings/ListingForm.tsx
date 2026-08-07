"use client";

import { useActionState, useState } from "react";
import type { Category, Listing } from "@prisma/client";
import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_DESCRIPTION_MIN_LENGTH,
  LISTING_STATUS,
  LISTING_TITLE_MAX_LENGTH,
  LISTING_TITLE_MIN_LENGTH,
} from "@/lib/constants";
import { INSTAGRAM_INPUT_MAX_LENGTH } from "@/modules/listings/instagram";
import { saveListingAction, type SaveListingState } from "./actions";

interface ListingFormProps {
  categories: Category[];
  listing?: Listing;
  error?: string;
  saved?: boolean;
}

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const initialState: SaveListingState = { error: null, values: null };

/**
 * Live character budget for a field. Shows the minimum while the text is still
 * too short — a bare "4 / 120" does not tell an admin why saving failed — and
 * warns before the browser silently stops accepting input at the limit.
 */
function CharacterCounter({
  length,
  min,
  max,
}: {
  length: number;
  min: number;
  max: number;
}) {
  const isTooShort = length < min;
  const isAtLimit = length >= max;
  const isNearLimit = !isAtLimit && length >= max * 0.9;

  const countClass = isAtLimit
    ? "text-amber-700"
    : isNearLimit
      ? "text-amber-600"
      : "text-slate-400";

  return (
    <span className="flex justify-between gap-3 text-xs font-normal">
      <span className={isTooShort ? "text-slate-500" : "text-transparent"}>
        {isTooShort ? `Mínimo de ${min} caracteres` : "."}
      </span>
      <span className={countClass}>
        {isAtLimit ? `Limite de ${max} caracteres atingido` : `${length} / ${max}`}
      </span>
    </span>
  );
}

export function ListingForm({ categories, listing, error, saved }: ListingFormProps) {
  const [state, formAction, pending] = useActionState(saveListingAction, initialState);

  // On a failed save, repopulate from what the user submitted; otherwise
  // fall back to the stored listing (edit) or empty fields (create).
  const values = state.values;
  const errorMessage = state.error ?? error;

  const initialTitle = values?.title ?? listing?.title ?? "";
  const initialDescription = values?.description ?? listing?.description ?? "";
  // Counts track the inputs, which stay uncontrolled so typing never round-trips
  // through React state.
  const [titleLength, setTitleLength] = useState(initialTitle.length);
  const [descriptionLength, setDescriptionLength] = useState(initialDescription.length);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      {saved && !state.error && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Anúncio salvo com sucesso.
        </p>
      )}
      {errorMessage && (
        <p
          aria-live="polite"
          className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Título *
        <input
          type="text"
          name="title"
          required
          minLength={LISTING_TITLE_MIN_LENGTH}
          maxLength={LISTING_TITLE_MAX_LENGTH}
          defaultValue={initialTitle}
          onChange={(event) => setTitleLength(event.target.value.length)}
          className={inputClass}
        />
        <CharacterCounter
          length={titleLength}
          min={LISTING_TITLE_MIN_LENGTH}
          max={LISTING_TITLE_MAX_LENGTH}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Descrição *
        <textarea
          name="description"
          required
          minLength={LISTING_DESCRIPTION_MIN_LENGTH}
          maxLength={LISTING_DESCRIPTION_MAX_LENGTH}
          rows={6}
          defaultValue={initialDescription}
          onChange={(event) => setDescriptionLength(event.target.value.length)}
          className={`${inputClass} resize-y`}
        />
        <CharacterCounter
          length={descriptionLength}
          min={LISTING_DESCRIPTION_MIN_LENGTH}
          max={LISTING_DESCRIPTION_MAX_LENGTH}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Categoria *
          <select
            name="categoryId"
            required
            defaultValue={values?.categoryId ?? listing?.categoryId ?? ""}
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
            defaultValue={values?.city ?? listing?.city ?? ""}
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
            defaultValue={values?.contactWhatsapp ?? listing?.contactWhatsapp ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Telefone
          <input
            type="text"
            name="contactPhone"
            maxLength={30}
            defaultValue={values?.contactPhone ?? listing?.contactPhone ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          E-mail de contato
          <input
            type="email"
            name="contactEmail"
            defaultValue={values?.contactEmail ?? listing?.contactEmail ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Instagram
          <input
            type="text"
            name="instagram"
            maxLength={INSTAGRAM_INPUT_MAX_LENGTH}
            placeholder="@perfil ou link do perfil"
            defaultValue={
              values?.instagram ??
              (listing?.instagram ? `@${listing.instagram}` : "")
            }
            className={inputClass}
          />
          <span className="text-xs font-normal text-slate-500">
            Cole o @ ou o link — o link do perfil é montado automaticamente.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Site
          <input
            type="url"
            name="websiteUrl"
            placeholder="https://…"
            defaultValue={values?.websiteUrl ?? listing?.websiteUrl ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Status *
        <select
          name="status"
          required
          defaultValue={values?.status ?? listing?.status ?? LISTING_STATUS.DRAFT}
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
          disabled={pending}
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? "Salvando…" : listing ? "Salvar alterações" : "Criar anúncio"}
        </button>
      </div>
    </form>
  );
}
