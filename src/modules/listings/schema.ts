import { z } from "zod";
import { LISTING_STATUS } from "@/lib/constants";

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
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
  websiteUrl: z
    .union([z.literal(""), z.url("URL inválida")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  city: optionalTrimmed(80),
  status: z.enum([
    LISTING_STATUS.DRAFT,
    LISTING_STATUS.PUBLISHED,
    LISTING_STATUS.ARCHIVED,
  ]),
});
export type ListingInput = z.infer<typeof listingInputSchema>;

export const listingQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  sort: z.enum(["recent", "rating"]).catch("recent"),
  page: z.coerce.number().int().min(1).catch(1),
});
export type ListingQuery = z.infer<typeof listingQuerySchema>;
