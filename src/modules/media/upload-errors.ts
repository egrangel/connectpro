// Why an image upload was refused. Callers pass the code around (through a URL,
// say) and turn it back into the message where they display it, so the text a
// visitor reads always comes from this table and never from the request.

export type UploadErrorCode = "empty-file" | "too-large" | "unsupported" | "svg-script" | "upload-failed";

export const UPLOAD_ERROR_MESSAGES: Record<UploadErrorCode, string> = {
  "empty-file": "Arquivo vazio.",
  "too-large": "Imagem acima de 10 MB.",
  unsupported: "Formato não suportado — use JPEG, PNG, WebP ou SVG.",
  "svg-script": "SVG com scripts não é permitido.",
  "upload-failed": "Falha ao enviar a imagem. Tente novamente.",
};

export function isUploadErrorCode(value: string): value is UploadErrorCode {
  return Object.hasOwn(UPLOAD_ERROR_MESSAGES, value);
}
