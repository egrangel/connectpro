import { describe, expect, test } from "vitest";
import {
  AUTH_FALLBACK_ERROR,
  GENERIC_LOGIN_ERROR,
  INVALID_LINK_ERROR,
  INVALID_RESET_ERROR,
  RATE_LIMIT_ERROR,
  REGISTER_CREATE_ERROR,
  resolveAuthError,
  type AuthFlow,
} from "./auth-errors";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./schema";

const CRAFTED = "Sua conta foi bloqueada, ligue para 0800";

function schemaMessages(result: { success: boolean; error?: { issues: { message: string }[] } }): string[] {
  return result.success ? [] : (result.error?.issues ?? []).map((issue) => issue.message);
}

describe("resolveAuthError", () => {
  test("returns nothing when there is no error", () => {
    expect(resolveAuthError("login", undefined)).toBeNull();
    expect(resolveAuthError("register", "")).toBeNull();
  });

  test.each<AuthFlow>(["register", "login", "forgotPassword", "resetPassword"])(
    "replaces text that did not come from the %s flow",
    (flow) => {
      // ?error= is part of the URL, so anyone can put text there; the page
      // must never display it on the real domain.
      expect(resolveAuthError(flow, CRAFTED)).toEqual({ message: AUTH_FALLBACK_ERROR[flow], hint: null });
    },
  );

  test("does not accept a message from another flow", () => {
    expect(resolveAuthError("login", REGISTER_CREATE_ERROR)?.message).toBe(AUTH_FALLBACK_ERROR.login);
  });

  test("offers login and recovery for the vague register failure", () => {
    expect(resolveAuthError("register", REGISTER_CREATE_ERROR)).toEqual({
      message: REGISTER_CREATE_ERROR,
      hint: "has-account",
    });
  });

  test("offers password recovery for the generic login failure", () => {
    expect(resolveAuthError("login", GENERIC_LOGIN_ERROR)).toEqual({
      message: GENERIC_LOGIN_ERROR,
      hint: "forgot-password",
    });
  });

  test("shows the rate limit message on every flow", () => {
    for (const flow of ["register", "login", "forgotPassword", "resetPassword"] as const) {
      expect(resolveAuthError(flow, RATE_LIMIT_ERROR)?.message).toBe(RATE_LIMIT_ERROR);
    }
  });

  test("forgot-password shows the invalid link messages the reset flow sends there", () => {
    expect(resolveAuthError("forgotPassword", INVALID_LINK_ERROR)?.message).toBe(INVALID_LINK_ERROR);
    expect(resolveAuthError("forgotPassword", INVALID_RESET_ERROR)?.message).toBe(INVALID_RESET_ERROR);
  });
});

// If a schema message changes, its allowlist must change with it; otherwise the
// visitor gets the fallback instead of the real reason.
describe("every schema message is on its flow's allowlist", () => {
  const cases: [AuthFlow, string[]][] = [
    [
      "register",
      [
        ...schemaMessages(registerSchema.safeParse({ email: "x", password: "1", displayName: "a", acceptedTerms: false })),
        ...schemaMessages(
          registerSchema.safeParse({ email: "a@b.co", password: "x".repeat(129), displayName: "x".repeat(81), acceptedTerms: true }),
        ),
      ],
    ],
    ["login", schemaMessages(loginSchema.safeParse({ email: "x", password: "" }))],
    ["forgotPassword", schemaMessages(forgotPasswordSchema.safeParse({ email: "x" }))],
    [
      "resetPassword",
      [
        ...schemaMessages(resetPasswordSchema.safeParse({ token: "a".repeat(64), password: "1", passwordConfirm: "1" })),
        ...schemaMessages(resetPasswordSchema.safeParse({ token: "a".repeat(64), password: "x".repeat(129), passwordConfirm: "y" })),
        ...schemaMessages(resetPasswordSchema.safeParse({ token: "a".repeat(64), password: "12345678", passwordConfirm: "87654321" })),
      ],
    ],
  ];

  test.each(cases)("%s", (flow, messages) => {
    expect(messages.length).toBeGreaterThan(0);
    for (const message of messages) {
      expect(resolveAuthError(flow, message)?.message).toBe(message);
    }
  });

  test("an invalid token is reported on forgot-password, where the action sends it", () => {
    const [message] = schemaMessages(
      resetPasswordSchema.safeParse({ token: "bad", password: "12345678", passwordConfirm: "12345678" }),
    );
    expect(resolveAuthError("forgotPassword", message)?.message).toBe(message);
  });
});
