import { describe, expect, test } from "vitest";
import {
  bannerSchema,
  brandingSchema,
  themeSchema,
  DEFAULT_BANNER,
  DEFAULT_BRANDING,
  DEFAULT_THEME,
} from "./schema";

describe("settings schemas", () => {
  test("defaults are valid against their own schemas", () => {
    expect(bannerSchema.safeParse(DEFAULT_BANNER).success).toBe(true);
    expect(themeSchema.safeParse(DEFAULT_THEME).success).toBe(true);
    expect(brandingSchema.safeParse(DEFAULT_BRANDING).success).toBe(true);
  });

  test("theme rejects malformed colors (CSS injection guard)", () => {
    const malicious = {
      ...DEFAULT_THEME,
      primary: "red; } body { display:none",
    };
    expect(themeSchema.safeParse(malicious).success).toBe(false);
  });

  test("theme rejects shorthand hex and accepts full hex", () => {
    expect(themeSchema.safeParse({ ...DEFAULT_THEME, accent: "#fff" }).success).toBe(false);
    expect(themeSchema.safeParse({ ...DEFAULT_THEME, accent: "#A1B2C3" }).success).toBe(true);
  });

  test("theme rejects unknown radius values", () => {
    expect(themeSchema.safeParse({ ...DEFAULT_THEME, radius: "huge" }).success).toBe(false);
  });

  test("branding requires a site name", () => {
    expect(brandingSchema.safeParse({ ...DEFAULT_BRANDING, siteName: " " }).success).toBe(false);
  });
});
