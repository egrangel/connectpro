import { z } from "zod";
import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_DESCRIPTION_MIN_LENGTH,
  LISTING_STATUS,
  LISTING_TITLE_MAX_LENGTH,
  LISTING_TITLE_MIN_LENGTH,
  SEARCH_QUERY_MAX_LENGTH,
} from "@/lib/constants";
import { isHttpUrl } from "@/lib/url";
import { extractInstagramHandle, INSTAGRAM_INPUT_MAX_LENGTH } from "./instagram";

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isHttpUrl(v), "URL inválida")
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

// Stored as a bare handle; see modules/listings/instagram.ts for why the URL is
// never persisted.
const instagramHandle = z
  .string()
  .trim()
  .max(INSTAGRAM_INPUT_MAX_LENGTH)
  .refine(
    (v) => v === "" || extractInstagramHandle(v) !== null,
    "Instagram inválido — informe o @ do perfil ou o link completo",
  )
  .transform((v) => (v === "" ? null : extractInstagramHandle(v)))
  .nullable()
  .optional();

export const listingInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(LISTING_TITLE_MIN_LENGTH, "Título muito curto")
    .max(LISTING_TITLE_MAX_LENGTH),
  description: z
    .string()
    .trim()
    .min(LISTING_DESCRIPTION_MIN_LENGTH, "Descreva o profissional")
    .max(LISTING_DESCRIPTION_MAX_LENGTH),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  contactPhone: optionalTrimmed(30),
  contactEmail: z
    .union([z.literal(""), z.email("E-mail de contato inválido")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  contactWhatsapp: optionalTrimmed(30),
  instagram: instagramHandle,
  websiteUrl: optionalHttpUrl,
  city: optionalTrimmed(80),
  status: z.enum([
    LISTING_STATUS.DRAFT,
    LISTING_STATUS.PUBLISHED,
    LISTING_STATUS.ARCHIVED,
  ]),
});
export type ListingInput = z.infer<typeof listingInputSchema>;

// Every field degrades instead of throwing: these come straight from the URL,
// where anyone can type anything, and a bad query string must never turn the
// home page into an error page.
export const listingQuerySchema = z.object({
  // Truncated, not rejected — a pasted wall of text should search its first
  // words. This also bounds how many terms one search can add to the report.
  q: z
    .string()
    .trim()
    .transform((value) => value.slice(0, SEARCH_QUERY_MAX_LENGTH))
    .optional()
    .catch(undefined),
  // An over-long slug cannot match a real category, so drop the filter.
  category: z.string().trim().max(120).optional().catch(undefined),
  sort: z.enum(["recent", "rating"]).catch("recent"),
  page: z.coerce.number().int().min(1).catch(1),
});
export type ListingQuery = z.infer<typeof listingQuerySchema>;