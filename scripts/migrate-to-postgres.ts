// One-off migration: copies categories, listings (with owners and reviews)
// from the local SQLite dev database into the production PostgreSQL database,
// uploading local photo files to Vercel Blob and rewriting their storageKeys.
//
// Usage: npx tsx scripts/migrate-to-postgres.ts
//
// Reads credentials from .env.production.local (created by
// `vercel env pull .env.production.local --environment=production`).
// Idempotent: every row is upserted by id; blob uploads overwrite.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { PrismaClient as SqliteClient } from "./generated/sqlite-client";

const ROOT = path.join(__dirname, "..");
const UPLOADS_DIR = path.join(ROOT, "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
};

async function loadEnvFile(fileName: string): Promise<Record<string, string>> {
  const raw = await readFile(path.join(ROOT, fileName), "utf8");
  const entries: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)="?([^"]*)"?\s*$/);
    if (match) entries[match[1]] = match[2];
  }
  return entries;
}

async function uploadPhotoToBlob(storageKey: string): Promise<string> {
  const fileName = path.basename(storageKey);
  const ext = fileName.split(".").pop() ?? "";
  const bytes = await readFile(path.join(UPLOADS_DIR, fileName));
  const blob = await put(`uploads/${fileName}`, bytes, {
    access: "public",
    contentType: CONTENT_TYPES[ext],
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

async function main(): Promise<void> {
  const env = await loadEnvFile(".env.production.local");
  const databaseUrl = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not found in .env.production.local — run `vercel env pull .env.production.local --environment=production` first.");
  }

  // Blob auth: explicit read-write token if present, otherwise OIDC
  // (VERCEL_OIDC_TOKEN + BLOB_STORE_ID picked up by @vercel/blob from env).
  if (!process.env.BLOB_READ_WRITE_TOKEN && env.BLOB_READ_WRITE_TOKEN) {
    process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const local = await loadEnvFile(".env.local").catch(() => ({}) as Record<string, string>);
    process.env.VERCEL_OIDC_TOKEN = local.VERCEL_OIDC_TOKEN ?? env.VERCEL_OIDC_TOKEN;
    process.env.BLOB_STORE_ID = env.BLOB_STORE_ID;
  }

  const source = new SqliteClient();
  const target = new PrismaClient({ datasourceUrl: databaseUrl });

  try {
    const categories = await source.category.findMany();
    const listings = await source.listing.findMany();
    const photos = await source.listingPhoto.findMany({ orderBy: { sortOrder: "asc" } });
    const reviews = await source.review.findMany();

    const referencedUserIds = new Set([
      ...listings.map((l) => l.createdById),
      ...reviews.map((r) => r.userId),
    ]);
    const users = await source.user.findMany({
      where: { id: { in: [...referencedUserIds] } },
    });

    console.info(
      `Source: ${categories.length} categories, ${listings.length} listings, ` +
        `${photos.length} photos, ${reviews.length} reviews, ${users.length} users`,
    );

    for (const category of categories) {
      await target.category.upsert({
        where: { id: category.id },
        create: category,
        update: category,
      });
    }
    console.info(`Categories migrated: ${categories.length}`);

    for (const user of users) {
      await target.user.upsert({ where: { id: user.id }, create: user, update: user });
    }
    console.info(`Users migrated: ${users.length}`);

    for (const listing of listings) {
      await target.listing.upsert({
        where: { id: listing.id },
        create: listing,
        update: listing,
      });
    }
    console.info(`Listings migrated: ${listings.length}`);

    for (const review of reviews) {
      await target.review.upsert({
        where: { id: review.id },
        create: review,
        update: review,
      });
    }
    console.info(`Reviews migrated: ${reviews.length}`);

    let uploaded = 0;
    const failed: string[] = [];
    for (const photo of photos) {
      try {
        const storageKey = photo.storageKey.startsWith("/uploads/")
          ? await uploadPhotoToBlob(photo.storageKey)
          : photo.storageKey; // already an absolute URL — keep as-is
        await target.listingPhoto.upsert({
          where: { id: photo.id },
          create: { ...photo, storageKey },
          update: { ...photo, storageKey },
        });
        uploaded++;
      } catch (error: unknown) {
        failed.push(
          `${photo.storageKey}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    console.info(`Photos migrated: ${uploaded}/${photos.length}`);
    if (failed.length > 0) {
      console.error(`Failed photos (fix blob access and re-run — the script is idempotent):`);
      for (const failure of failed) console.error(`  - ${failure}`);
      process.exitCode = 1;
    }
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
