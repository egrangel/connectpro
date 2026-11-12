import { describe, expect, test } from "vitest";
import { UPLOAD_ERROR_MESSAGES, type UploadErrorCode } from "@/modules/media/upload-errors";
import { PHOTO_ERROR_FALLBACK, photoErrorMessage } from "./photo-errors";

describe("photoErrorMessage", () => {
  test("returns nothing when there is no error", () => {
    expect(photoErrorMessage(undefined, 10)).toBeNull();
    expect(photoErrorMessage("", 10)).toBeNull();
  });

  test("fills in the configured photo limit", () => {
    expect(photoErrorMessage("photo-limit", 7)).toBe("Limite de 7 fotos por anúncio atingido.");
  });

  test("explains an empty selection", () => {
    expect(photoErrorMessage("no-photo", 10)).toBe("Selecione ao menos uma imagem.");
  });

  test.each(Object.keys(UPLOAD_ERROR_MESSAGES) as UploadErrorCode[])(
    "shows the storage message for %s",
    (code) => {
      expect(photoErrorMessage(code, 10)).toBe(UPLOAD_ERROR_MESSAGES[code]);
    },
  );

  test("never shows text from the URL", () => {
    // ?error= is public: a crafted link must not put its own words on the page,
    // not even text that happens to match one of our messages.
    expect(photoErrorMessage("Sua conta foi bloqueada, ligue para 0800", 10)).toBe(PHOTO_ERROR_FALLBACK);
    expect(photoErrorMessage("Selecione ao menos uma imagem.", 10)).toBe(PHOTO_ERROR_FALLBACK);
  });
});
