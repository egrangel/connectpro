import { SEARCH_TERM_MAX_LENGTH, SEARCH_TERM_MIN_LENGTH } from "@/lib/constants";

/**
 * Decides which of a query's terms are worth counting in the search report.
 *
 * Input comes from `searchTerms` (src/lib/text.ts), so terms are already
 * lowercase, unaccented and punctuation-free — the same tokens the search
 * itself matched on, which keeps the report honest about what users typed.
 *
 * Repeats collapse: searching "pintor pintor" is one search for "pintor", not
 * two. Very short tokens are noise (stray letters, "de", "e") and very long
 * ones are junk paste, so both are dropped rather than stored forever.
 */
export function recordableTerms(terms: readonly string[]): string[] {
  const kept = terms.filter(
    (term) =>
      term.length >= SEARCH_TERM_MIN_LENGTH && term.length <= SEARCH_TERM_MAX_LENGTH,
  );
  return [...new Set(kept)];
}
