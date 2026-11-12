"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  MAX_PHOTO_SIZE_BYTES,
  PHOTO_MIN_HEIGHT,
  PHOTO_MIN_WIDTH,
  PHOTO_RECOMMENDED_HEIGHT,
  PHOTO_RECOMMENDED_WIDTH,
} from "@/lib/constants";
import { uploadPhotoAction } from "@/modules/listings/photo-actions";
import { PHOTO_FORM_STYLES, type FormVariant } from "./form-styles";

interface PhotoUploadFormProps {
  listingId: string;
  remaining: number;
  /** "site" follows the public theme (member pages); "admin" stays unthemed. */
  variant?: FormVariant;
}

function SubmitButton({ hasFiles, className }: { hasFiles: boolean; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!hasFiles || pending}
      className={className}
    >
      {pending ? "Enviando…" : "Enviar fotos"}
    </button>
  );
}

const MAX_PHOTO_SIZE_MB = Math.round(MAX_PHOTO_SIZE_BYTES / (1024 * 1024));

export function PhotoUploadForm({ listingId, remaining, variant = "admin" }: PhotoUploadFormProps) {
  const styles = PHOTO_FORM_STYLES[variant];
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <form action={uploadPhotoAction} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="listingId" value={listingId} />

      <div className={styles.guide}>
        <p className={styles.guideTitle}>Resolução recomendada</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>
            Ideal: <strong>{PHOTO_RECOMMENDED_WIDTH} × {PHOTO_RECOMMENDED_HEIGHT} px</strong>{" "}
            (proporção 4:3) — mínimo de {PHOTO_MIN_WIDTH} × {PHOTO_MIN_HEIGHT} px.
          </li>
          <li>
            A mesma foto é cortada em <strong>4:3</strong> nos cards da busca e em{" "}
            <strong>16:9</strong> na página do anúncio: deixe o assunto centralizado
            e evite texto perto das bordas.
          </li>
          <li>
            Fotos deitadas (horizontais) funcionam melhor que fotos em pé; a primeira
            foto é a capa do anúncio.
          </li>
        </ul>
      </div>

      <label className={styles.dropzone}>
        <svg
          aria-hidden="true"
          className={styles.dropzoneIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className={styles.dropzoneTitle}>
          Clique para escolher as fotos
        </span>
        <span className={styles.dropzoneHint}>
          JPEG, PNG ou WebP · máx. {MAX_PHOTO_SIZE_MB} MB cada · até {remaining}{" "}
          {remaining === 1 ? "foto restante" : "fotos restantes"}
        </span>
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          className="sr-only"
          onChange={(event) =>
            setFileNames(Array.from(event.target.files ?? []).map((file) => file.name))
          }
        />
      </label>

      {fileNames.length > 0 && (
        <p className={styles.selected}>
          {fileNames.length === 1
            ? "1 foto selecionada: "
            : `${fileNames.length} fotos selecionadas: `}
          <span className={styles.selectedNames}>{fileNames.join(", ")}</span>
        </p>
      )}

      <div>
        <SubmitButton hasFiles={fileNames.length > 0} className={styles.submit} />
      </div>
    </form>
  );
}
