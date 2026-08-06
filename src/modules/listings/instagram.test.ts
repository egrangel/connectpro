import { describe, expect, test } from "vitest";
import { extractInstagramHandle, instagramProfileUrl } from "./instagram";

describe("extractInstagramHandle", () => {
  test("accepts a bare handle, with or without @", () => {
    expect(extractInstagramHandle("joao.silva")).toBe("joao.silva");
    expect(extractInstagramHandle("@joao.silva")).toBe("joao.silva");
    expect(extractInstagramHandle("  @joao_silva  ")).toBe("joao_silva");
  });

  test("accepts profile URLs in the shapes people actually paste", () => {
    expect(extractInstagramHandle("https://www.instagram.com/joao.silva")).toBe("joao.silva");
    expect(extractInstagramHandle("https://instagram.com/joao.silva/")).toBe("joao.silva");
    expect(extractInstagramHandle("instagram.com/joao.silva")).toBe("joao.silva");
    expect(extractInstagramHandle("http://www.instagram.com/joao.silva")).toBe("joao.silva");
  });

  test("drops the share-tracking query string", () => {
    expect(
      extractInstagramHandle("https://www.instagram.com/joao.silva?igsh=MXY2cHJ5"),
    ).toBe("joao.silva");
  });

  test("normalizes case, since Instagram handles are case-insensitive", () => {
    expect(extractInstagramHandle("@Joao.Silva")).toBe("joao.silva");
  });

  test("rejects links to other hosts, so only Instagram can be linked", () => {
    expect(extractInstagramHandle("https://evil.example/joao")).toBeNull();
    expect(extractInstagramHandle("https://instagram.com.evil.example/joao")).toBeNull();
  });

  test("rejects dangerous schemes instead of storing them", () => {
    expect(extractInstagramHandle("javascript:alert(1)")).toBeNull();
    expect(extractInstagramHandle("javascript:alert(1)/x")).toBeNull();
  });

  test("rejects handles with characters Instagram does not allow", () => {
    expect(extractInstagramHandle("joao silva")).toBeNull();
    expect(extractInstagramHandle("joão")).toBeNull();
    expect(extractInstagramHandle("joao/silva")).toBeNull();
  });

  test("rejects empty input and over-long handles", () => {
    expect(extractInstagramHandle("")).toBeNull();
    expect(extractInstagramHandle("   ")).toBeNull();
    expect(extractInstagramHandle("a".repeat(31))).toBeNull();
    expect(extractInstagramHandle("a".repeat(30))).toBe("a".repeat(30));
  });

  test("builds the profile URL from a stored handle", () => {
    expect(instagramProfileUrl("joao.silva")).toBe("https://www.instagram.com/joao.silva");
  });
});
