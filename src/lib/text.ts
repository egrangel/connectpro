const COMBINING_MARKS = /[̀-ͯ]/g;

/** Strips diacritics: "Elétrica São Paulo" -> "Eletrica Sao Paulo". */
export function removeAccents(value: string): string {
  return value.normalize("NFD").replace(COMBINING_MARKS, "");
}

/** URL-safe slug: "Aulas de Violão!" -> "aulas-de-violao". */
export function slugify(value: string): string {
  return removeAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalized haystack for substring search (SQLite has no case-insensitive
 * `contains` in Prisma). Mirrors the Postgres unaccent+lower strategy.
 */
export function toSearchText(...parts: Array<string | null | undefined>): string {
  return removeAccents(parts.filter(Boolean).join(" "))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
