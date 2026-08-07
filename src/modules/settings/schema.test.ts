import { describe, expect, test } from "vitest";
import { DEFAULT_MAX_PHOTOS_PER_LISTING, TERMS_TEXT_MAX_LENGTH } from "@/lib/constants";
import {
  bannerSchema,
  slideSchema,
  brandingSchema,
  featuresSchema,
  termsSchema,
  themeSchema,
  DEFAULT_BANNER,
  DEFAULT_BRANDING,
  DEFAULT_FEATURES,
  DEFAULT_TERMS,
  DEFAULT_THEME,
} from "./schema";

describe("settings schemas", () => {
  test("defaults are valid against their own schemas", () => {
    expect(bannerSchema.safeParse(DEFAULT_BANNER).success).toBe(true);
    expect(themeSchema.safeParse(DEFAULT_THEME).success).toBe(true);
    expect(brandingSchema.safeParse(DEFAULT_BRANDING).success).toBe(true);
    expect(featuresSchema.safeParse(DEFAULT_FEATURES).success).toBe(true);
    expect(termsSchema.safeParse(DEFAULT_TERMS).success).toBe(true);
  });

  test("banner requires at least one slide", () => {
    expect(bannerSchema.safeParse({ enabled: true, slides: [] }).success).toBe(false);
  });

  test("slide CTA accepts anchors, internal paths, and HTTP(S) URLs", () => {
    const slide = DEFAULT_BANNER.slides[0];
    expect(slideSchema.safeParse({ ...slide, ctaUrl: "#listagens" }).success).toBe(true);
    expect(slideSchema.safeParse({ ...slide, ctaUrl: "/register" }).success).toBe(true);
    expect(slideSchema.safeParse({ ...slide, ctaUrl: "https://example.com" }).success).toBe(true);
  });

  test("slide CTA rejects unsafe URLs", () => {
    const slide = DEFAULT_BANNER.slides[0];
    expect(slideSchema.safeParse({ ...slide, ctaUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(slideSchema.safeParse({ ...slide, ctaUrl: "//evil.example" }).success).toBe(false);
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

  test("review system is visible by default", () => {
    expect(DEFAULT_FEATURES.reviewsEnabled).toBe(true);
  });

  test("features accept both states of the review toggle", () => {
    expect(
      featuresSchema.safeParse({ reviewsEnabled: false }).data?.reviewsEnabled,
    ).toBe(false);
    expect(
      featuresSchema.safeParse({ reviewsEnabled: true }).data?.reviewsEnabled,
    ).toBe(true);
  });

  test("features reject non-boolean and missing toggles, so legacy rows fall back to defaults", () => {
    expect(featuresSchema.safeParse({}).success).toBe(false);
    expect(featuresSchema.safeParse({ reviewsEnabled: "on" }).success).toBe(false);
  });

  test("a row saved before the photo limit existed keeps its review setting", () => {
    // Regression: if maxPhotosPerListing were required, this parse would fail
    // and getSiteConfig would fall back to DEFAULT_FEATURES, silently turning
    // reviews back on for anyone who had disabled them.
    const legacy = featuresSchema.safeParse({ reviewsEnabled: false });
    expect(legacy.success).toBe(true);
    expect(legacy.data).toEqual({
      reviewsEnabled: false,
      maxPhotosPerListing: DEFAULT_MAX_PHOTOS_PER_LISTING,
    });
  });

  test("consent agreement rejects an empty text", () => {
    // An admin who blanks the field would leave the registration form asking
    // people to agree to nothing.
    expect(termsSchema.safeParse({ text: "" }).success).toBe(false);
    expect(termsSchema.safeParse({ text: "   \n  " }).success).toBe(false);
    expect(termsSchema.safeParse({}).success).toBe(false);
  });

  test("consent agreement keeps line breaks and rejects text past the limit", () => {
    const multiline = "Primeira linha.\n\nSegunda linha.";
    expect(termsSchema.safeParse({ text: multiline }).data?.text).toBe(multiline);
    expect(
      termsSchema.safeParse({ text: "a".repeat(TERMS_TEXT_MAX_LENGTH + 1) }).success,
    ).toBe(false);
  });

  test("the default agreement states the disclaimer it exists for", () => {
    // The text is admin-editable, but shipping a default that omitted the
    // liability disclaimer would put every portal live without one.
    expect(DEFAULT_TERMS.text).toMatch(/NÃO se responsabiliza/);
  });

  test("photo limit accepts numeric strings from the form and rejects out-of-range values", () => {
    expect(
      featuresSchema.safeParse({ reviewsEnabled: true, maxPhotosPerListing: "6" }).data
        ?.maxPhotosPerListing,
    ).toBe(6);

    for (const invalid of [0, -1, 21, 2.5]) {
      expect(
        featuresSchema.safeParse({ reviewsEnabled: true, maxPhotosPerListing: invalid })
          .success,
      ).toBe(false);
    }
  });
});
