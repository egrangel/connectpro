import { describe, expect, test } from "vitest";
import { isHttpUrl, isSafePublicHref } from "./url";

describe("isHttpUrl", () => {
  test("accepts only absolute HTTP(S) URLs", () => {
    expect(isHttpUrl("https://example.com")).toBe(true);
    expect(isHttpUrl("http://example.com/path")).toBe(true);
    expect(isHttpUrl("/internal")).toBe(false);
    expect(isHttpUrl("mailto:test@example.com")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("isSafePublicHref", () => {
  test("accepts local anchors, same-site paths, and HTTP(S) URLs", () => {
    expect(isSafePublicHref("#listagens")).toBe(true);
    expect(isSafePublicHref("/p/example")).toBe(true);
    expect(isSafePublicHref("https://example.com")).toBe(true);
  });

  test("rejects unsafe or ambiguous hrefs", () => {
    expect(isSafePublicHref("#")).toBe(false);
    expect(isSafePublicHref("//evil.example")).toBe(false);
    expect(isSafePublicHref("javascript:alert(1)")).toBe(false);
    expect(isSafePublicHref("data:text/html,hello")).toBe(false);
  });
});