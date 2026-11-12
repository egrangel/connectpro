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
import type { SaveListingState } from "@/modules/listings/form-state";
import { LISTING_FORM_STYLES, type FormVariant } from "./form-styles";

interface ListingFormProps {
  categories: Category[];
  listing?: Listing;
  error?: string;
  saved?: boolean;
  /** Server action to submit to — admin and author surfaces pass their own. */
  action: (state: SaveListingState, formData: FormData) => Promise<SaveListingState>;
  /**
   * Authors submit drafts and never choose the status; only admins decide what
   * is published, so the field is not rendered for them at all.
   */
  canChangeStatus?: boolean;
  /** "site" follows the public theme (member pages); "admin" stays unthemed. */
  variant?: FormVariant;
}

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
  idleClass,
}: {
  length: number;
  min: number;
  max: number;
  idleClass: string;
}) {
  const isTooShort = length < min;
  const isAtLimit = length >= max;
  const isNearLimit = !isAtLimit && length >= max * 0.9;

  const countClass = isAtLimit
    ? "text-amber-700"
    : isNearLimit
      ? "text-amber-600"
      : idleClass;

  return (
    <span className="flex justify-between gap-3 text-xs font-normal">
      <span className={isTooShort ? idleClass : "text-transparent"}>
        {isTooShort ? `Mínimo de ${min} caracteres` : "."}
      </span>
      <span className={countClass}>
        {isAtLimit ? `Limite de ${max} caracteres atingido` : `${length} / ${max}`}
      </span>
    </span>
  );
}

export function ListingForm({
  categories,
  listing,
  error,
  saved,
  action,
  canChangeStatus = true,
  variant = "admin",
}: ListingFormProps) {
  const styles = LISTING_FORM_STYLES[variant];
  const inputClass = styles.input;
  const [state, formAction, pending] = useActionState(action, initialState);

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
        <p role="status" className={styles.success}>
          Anúncio salvo com sucesso.
        </p>
      )}
      {errorMessage && (
        <p
          aria-live="polite"
          className={styles.error}
        >
          {errorMessage}
        </p>
      )}

      <label className={styles.label}>
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
          idleClass={styles.counterIdle}
        />
      </label>

      <label className={styles.label}>
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
          idleClass={styles.counterIdle}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={styles.label}>
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

        <label className={styles.label}>
          Cidade
          <input
            type="text"
            name="city"
            maxLength={80}
            defaultValue={values?.city ?? listing?.city ?? ""}
            className={inputClass}
          />
        </label>

        <label className={styles.label}>
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

        <label className={styles.label}>
          Telefone
          <input
            type="text"
            name="contactPhone"
            maxLength={30}
            defaultValue={values?.contactPhone ?? listing?.contactPhone ?? ""}
            className={inputClass}
          />
        </label>

        <label className={styles.label}>
          E-mail de contato
          <input
            type="email"
            name="contactEmail"
            defaultValue={values?.contactEmail ?? listing?.contactEmail ?? ""}
            className={inputClass}
          />
        </label>

        <label className={styles.label}>
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
          <span className={styles.hint}>
            Cole o @ ou o link — o link do perfil é montado automaticamente.
          </span>
        </label>

        <label className={styles.label}>
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

      {canChangeStatus && (
        <label className={styles.label}>
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
      )}

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className={styles.submit}
        >
          {pending ? "Salvando…" : listing ? "Salvar alterações" : "Criar anúncio"}
        </button>
      </div>
    </form>
  );
}
