import { describe, expect, test } from "vitest";
import { removeAccents, slugify, toSearchText } from "./text";

describe("removeAccents", () => {
  test("strips Portuguese diacritics", () => {
    expect(removeAccents("Violão São João Elétrica ção")).toBe(
      "Violao Sao Joao Eletrica cao",
    );
  });

  test("leaves plain ASCII untouched", () => {
    expect(removeAccents("hello world 123")).toBe("hello world 123");
  });
});

describe("slugify", () => {
  test("produces url-safe lowercase slugs", () => {
    expect(slugify("Aulas de Violão!")).toBe("aulas-de-violao");
  });

  test("collapses consecutive separators and trims edges", () => {
    expect(slugify("  --João & Maria--  ")).toBe("joao-maria");
  });

  test("returns empty string for symbol-only input", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("toSearchText", () => {
  test("lowercases, unaccents and joins parts", () => {
    expect(toSearchText("Elétrica Predial", "São Paulo")).toBe(
      "eletrica predial sao paulo",
    );
  });

  test("skips null and undefined parts", () => {
    expect(toSearchText("Pintor", null, undefined, "Curitiba")).toBe(
      "pintor curitiba",
    );
  });

  test("collapses internal whitespace", () => {
    expect(toSearchText("a   b\n\nc")).toBe("a b c");
  });
});
