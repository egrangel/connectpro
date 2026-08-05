import { describe, expect, test } from "vitest";
import { isHttpUrl, isSafePublicHref, resolveBaseUrl } from "./url";

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

describe("resolveBaseUrl", () => {
  test("prefers the explicitly configured origin", () => {
    expect(resolveBaseUrl({ APP_BASE_URL: "https://connect.example" })).toBe(
      "https://connect.example",
    );
  });

  test("drops trailing slashes so links do not double up", () => {
    expect(resolveBaseUrl({ APP_BASE_URL: "https://connect.example//" })).toBe(
      "https://connect.example",
    );
  });

  test("falls back to the Vercel production host", () => {
    expect(resolveBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "connect.vercel.app" })).toBe(
      "https://connect.vercel.app",
    );
  });

  test("tolerates a Vercel host that already carries a scheme", () => {
    expect(resolveBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "https://connect.vercel.app/" })).toBe(
      "https://connect.vercel.app",
    );
  });

  test("ignores a configured value that is not an HTTP(S) origin", () => {
    expect(
      resolveBaseUrl({
        APP_BASE_URL: "javascript:alert(1)",
        VERCEL_PROJECT_PRODUCTION_URL: "connect.vercel.app",
      }),
    ).toBe("https://connect.vercel.app");
  });

  test("falls back to localhost when nothing is configured", () => {
    expect(resolveBaseUrl({})).toBe("http://localhost:3000");
    expect(resolveBaseUrl({ APP_BASE_URL: "   " })).toBe("http://localhost:3000");
  });
});