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
import { uploadPhotoAction } from "./actions";

interface PhotoUploadFormProps {
  listingId: string;
  remaining: number;
}

function SubmitButton({ hasFiles }: { hasFiles: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!hasFiles || pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Enviando…" : "Enviar fotos"}
    </button>
  );
}

const MAX_PHOTO_SIZE_MB = Math.round(MAX_PHOTO_SIZE_BYTES / (1024 * 1024));

export function PhotoUploadForm({ listingId, remaining }: PhotoUploadFormProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <form action={uploadPhotoAction} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="listingId" value={listingId} />

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <p className="font-semibold text-slate-700">Resolução recomendada</p>
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

      <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-slate-400 hover:bg-slate-50 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
        <svg
          aria-hidden="true"
          className="h-8 w-8 text-slate-400 transition group-hover:text-slate-500"
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
        <span className="text-sm font-semibold text-slate-700">
          Clique para escolher as fotos
        </span>
        <span className="text-xs text-slate-400">
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
        <p className="text-xs text-slate-500">
          {fileNames.length === 1
            ? "1 foto selecionada: "
            : `${fileNames.length} fotos selecionadas: `}
          <span className="font-medium text-slate-700">{fileNames.join(", ")}</span>
        </p>
      )}

      <div>
        <SubmitButton hasFiles={fileNames.length > 0} />
      </div>
    </form>
  );
}
