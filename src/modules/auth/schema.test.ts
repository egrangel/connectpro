import { describe, expect, test } from "vitest";
import { forgotPasswordSchema, registerSchema, resetPasswordSchema } from "./schema";

const VALID_TOKEN = "a".repeat(64);

function firstIssue(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe("forgotPasswordSchema", () => {
  test("accepts a well-formed address", () => {
    expect(forgotPasswordSchema.safeParse({ email: "joana@example.com" }).success).toBe(true);
  });

  test("rejects a malformed address", () => {
    const result = forgotPasswordSchema.safeParse({ email: "joana" });
    expect(result.success).toBe(false);
    expect(firstIssue(result)).toBe("E-mail inválido");
  });

  test("rejects an address beyond the storage limit", () => {
    const email = `${"a".repeat(250)}@example.com`;
    expect(forgotPasswordSchema.safeParse({ email }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    email: "joana@example.com",
    password: "senha-forte-123",
    displayName: "Joana",
    acceptedTerms: true as const,
  };

  test("accepts a registration that agreed to the consent terms", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  test("rejects a registration without consent, however the box was left", () => {
    // An unchecked box posts nothing, so `false` is what the action derives —
    // but a hand-crafted POST can send anything, and none of it may pass.
    for (const acceptedTerms of [false, undefined, "on", 1, null]) {
      const result = registerSchema.safeParse({ ...valid, acceptedTerms });
      expect(result.success).toBe(false);
      expect(firstIssue(result)).toBe(
        "É preciso aceitar o termo de consentimento para criar a conta",
      );
    }
  });
});

describe("resetPasswordSchema", () => {
  const valid = {
    token: VALID_TOKEN,
    password: "senha-nova-123",
    passwordConfirm: "senha-nova-123",
  };

  test("accepts a matching pair with a well-formed token", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  test("rejects a token that is not 64 hex chars", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, token: "deadbeef" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path[0]).toBe("token");
  });

  test("rejects a password under 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      password: "curta1",
      passwordConfirm: "curta1",
    });
    expect(result.success).toBe(false);
    expect(firstIssue(result)).toBe("A senha deve ter no mínimo 8 caracteres");
  });

  test("rejects a confirmation that does not match", () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      passwordConfirm: "outra-senha-123",
    });
    expect(result.success).toBe(false);
    expect(firstIssue(result)).toBe("As senhas não conferem");
    expect(result.error?.issues[0]?.path[0]).toBe("passwordConfirm");
  });
});
