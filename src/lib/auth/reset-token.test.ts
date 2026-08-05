import { describe, expect, test } from "vitest";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/lib/constants";
import {
  generateResetToken,
  hashResetToken,
  isResetTokenExpired,
  isResetTokenFormat,
  resetTokenExpiry,
} from "./reset-token";

describe("generateResetToken", () => {
  test("produces a 64-char hex string", () => {
    expect(generateResetToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  test("never repeats across calls", () => {
    const tokens = new Set(Array.from({ length: 200 }, generateResetToken));
    expect(tokens.size).toBe(200);
  });
});

describe("hashResetToken", () => {
  test("is deterministic for the same token", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).toBe(hashResetToken(token));
  });

  test("differs from the raw token, so a leaked hash is not a usable link", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).not.toBe(token);
  });

  test("maps different tokens to different hashes", () => {
    expect(hashResetToken("a")).not.toBe(hashResetToken("b"));
  });
});

describe("isResetTokenFormat", () => {
  test("accepts generated tokens", () => {
    expect(isResetTokenFormat(generateResetToken())).toBe(true);
  });

  test("rejects malformed values", () => {
    expect(isResetTokenFormat("")).toBe(false);
    expect(isResetTokenFormat("nope")).toBe(false);
    expect(isResetTokenFormat("A".repeat(64))).toBe(false); // uppercase hex
    expect(isResetTokenFormat("a".repeat(63))).toBe(false);
    expect(isResetTokenFormat("a".repeat(65))).toBe(false);
    expect(isResetTokenFormat(`${"a".repeat(64)}\n`)).toBe(false);
  });
});

describe("resetTokenExpiry", () => {
  test("expires the configured number of minutes after issuing", () => {
    const issuedAt = new Date("2026-08-05T10:00:00.000Z");
    const expiresAt = resetTokenExpiry(issuedAt);

    expect(expiresAt.getTime() - issuedAt.getTime()).toBe(
      PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    );
  });
});

describe("isResetTokenExpired", () => {
  const now = new Date("2026-08-05T10:00:00.000Z");

  test("is valid while the deadline is in the future", () => {
    expect(isResetTokenExpired(new Date("2026-08-05T10:00:01.000Z"), now)).toBe(false);
  });

  test("is expired exactly at the deadline", () => {
    expect(isResetTokenExpired(new Date(now), now)).toBe(true);
  });

  test("is expired after the deadline", () => {
    expect(isResetTokenExpired(new Date("2026-08-05T09:59:59.000Z"), now)).toBe(true);
  });
});
