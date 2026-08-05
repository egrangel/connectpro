import { createHash, randomBytes } from "node:crypto";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/lib/constants";

const TOKEN_BYTES = 32;
const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

/** 256 bits of entropy, hex encoded — the value that travels in the e-mail link. */
export function generateResetToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

/** Lookup key stored in the database; the raw token is never persisted. */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Cheap shape check so malformed tokens never reach the database. */
export function isResetTokenFormat(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}

export function resetTokenExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

export function isResetTokenExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}
