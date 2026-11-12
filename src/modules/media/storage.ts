// Two storage drivers behind one interface (docs/ARCHITECTURE.md §10):
// - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production/Vercel) —
//   storageKey is the public blob URL.
// - Local disk otherwise (development): files land in public/uploads and are
//   served statically — storageKey is the /uploads/... path.

import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { del as blobDel, put as blobPut } from "@vercel/blob";
import { MAX_PHOTO_SIZE_BYTES } from "@/lib/constants";
import { UPLOAD_ERROR_MESSAGES, type UploadErrorCode } from "./upload-errors";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const UPLOADS_PREFIX = "/uploads/";
const BLOB_PREFIX = "uploads/";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function isBlobStorageConfigured(): boolean {
  // Classic stores inject BLOB_READ_WRITE_TOKEN. OIDC-managed stores only
  // inject BLOB_STORE_ID — on Vercel the SDK resolves credentials from the
  // runtime OIDC context, so the store id plus the VERCEL marker is enough.
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL),
  );
}

interface MagicSignature {
  ext: string;
  matches: (bytes: Uint8Array) => boolean;
}

// Content type comes from actual file bytes, never the client's declaration.
const SIGNATURES: MagicSignature[] = [
  {
    ext: "jpg",
    matches: (b) => b.length > 2 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    matches: (b) =>
      b.length > 7 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "webp",
    matches: (b) =>
      b.length > 11 &&
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    ext: "svg",
    // SVG is XML text — strip optional BOM and leading whitespace then check
    // for the opening tag. Script tags are blocked to prevent stored XSS.
    matches: (b) => {
      const head = new TextDecoder().decode(b.slice(0, 512)).replace(/^﻿/, "").trimStart();
      return head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"));
    },
  },
];

export interface SaveResult {
  ok: boolean;
  storageKey?: string;
  /** Message to show; derived from errorCode. */
  error?: string;
  /** Why the upload was refused, for callers that pass it through a URL. */
  errorCode?: UploadErrorCode;
}

function uploadFailure(code: UploadErrorCode): SaveResult {
  return { ok: false, error: UPLOAD_ERROR_MESSAGES[code], errorCode: code };
}

export async function saveImageUpload(file: File): Promise<SaveResult> {
  if (file.size === 0) {
    return uploadFailure("empty-file");
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return uploadFailure("too-large");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = SIGNATURES.find((s) => s.matches(bytes));
  if (!signature) {
    return uploadFailure("unsupported");
  }

  if (signature.ext === "svg") {
    const content = new TextDecoder().decode(bytes);
    if (/<script/i.test(content)) {
      return uploadFailure("svg-script");
    }
  }

  // Server-generated name only: user filenames never touch storage.
  const fileName = `${randomUUID()}.${signature.ext}`;

  if (isBlobStorageConfigured()) {
    try {
      const blob = await blobPut(`${BLOB_PREFIX}${fileName}`, Buffer.from(bytes), {
        access: "public",
        contentType: CONTENT_TYPES[signature.ext],
        addRandomSuffix: false,
      });
      return { ok: true, storageKey: blob.url };
    } catch {
      return uploadFailure("upload-failed");
    }
  }

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, fileName), bytes);

  return { ok: true, storageKey: `${UPLOADS_PREFIX}${fileName}` };
}

export async function deleteImageUpload(storageKey: string): Promise<void> {
  // Blob-stored keys are absolute URLs; local keys are /uploads/... paths.
  if (storageKey.startsWith("https://")) {
    if (!isBlobStorageConfigured()) return;
    try {
      await blobDel(storageKey);
    } catch {
      // Missing blob is not an error worth surfacing — the DB row is the source of truth.
    }
    return;
  }

  if (!storageKey.startsWith(UPLOADS_PREFIX)) return;
  const fileName = path.basename(storageKey);
  try {
    await unlink(path.join(UPLOADS_DIR, fileName));
  } catch {
    // Missing file is not an error worth surfacing — the DB row is the source of truth.
  }
}
