import { describe, expect, test } from "vitest";
import { searchTerms } from "@/lib/text";
import { recordableTerms } from "./terms";

describe("recordableTerms", () => {
  test("keeps normalized terms in the order they were typed", () => {
    expect(recordableTerms(["eletricista", "urgente"])).toEqual([
      "eletricista",
      "urgente",
    ]);
  });

  test("counts a repeated word once per search", () => {
    expect(recordableTerms(["pintor", "pintor", "casa"])).toEqual(["pintor", "casa"]);
  });

  test("drops filler words and stray letters below the minimum length", () => {
    expect(recordableTerms(["a", "de", "aulas"])).toEqual(["aulas"]);
  });

  test("drops pasted junk above the maximum length", () => {
    expect(recordableTerms(["x".repeat(41)])).toEqual([]);
    expect(recordableTerms(["x".repeat(40)])).toEqual(["x".repeat(40)]);
  });

  test("returns nothing for an empty query", () => {
    expect(recordableTerms([])).toEqual([]);
  });

  test("records what the search actually matched on, accents and case removed", () => {
    // The report must mirror the search: "Eletricista São Paulo" and
    // "eletricista sao paulo" are the same demand, not two different terms.
    expect(recordableTerms(searchTerms("Eletricista São Paulo"))).toEqual([
      "eletricista",
      "sao",
      "paulo",
    ]);
    expect(recordableTerms(searchTerms("Aulas de Violão!"))).toEqual([
      "aulas",
      "violao",
    ]);
  });
});
