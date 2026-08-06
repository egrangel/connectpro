import { z } from "zod";
import { LISTING_STATUS, SEARCH_QUERY_MAX_LENGTH } from "@/lib/constants";
import { isHttpUrl } from "@/lib/url";

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

export const listingInputSchema = z.object({
  title: z.string().trim().min(3, "Título muito curto").max(120),
  description: z.string().trim().min(10, "Descreva o profissional").max(5000),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  contactPhone: optionalTrimmed(30),
  contactEmail: z
    .union([z.literal(""), z.email("E-mail de contato inválido")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  contactWhatsapp: optionalTrimmed(30),
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