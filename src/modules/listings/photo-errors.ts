import { isUploadErrorCode, UPLOAD_ERROR_MESSAGES } from "@/modules/media/upload-errors";

// The photo actions redirect back with ?error=<code>. The URL is public, so the
// listing pages only ever show the message for a known code: anything else,
// including text that reads like one of our messages, gets the fallback.

export type PhotoErrorCode = "photo-limit" | "no-photo";

export const PHOTO_ERROR_FALLBACK = "Não foi possível enviar as fotos. Tente de novo.";

export function photoErrorMessage(code: string | undefined, maxPhotosPerListing: number): string | null {
  if (!code) return null;
  if (code === "photo-limit") return `Limite de ${maxPhotosPerListing} fotos por anúncio atingido.`;
  if (code === "no-photo") return "Selecione ao menos uma imagem.";
  if (isUploadErrorCode(code)) return UPLOAD_ERROR_MESSAGES[code];
  return PHOTO_ERROR_FALLBACK;
}
