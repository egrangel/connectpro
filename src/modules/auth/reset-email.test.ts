import { describe, expect, test } from "vitest";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/lib/constants";
import { buildPasswordResetEmail, buildResetUrl } from "./reset-email";

const GRANT = { email: "joana@example.com", displayName: "Joana" };
const TOKEN = "a".repeat(64);

describe("buildResetUrl", () => {
  test("points at the reset page with the token in the query", () => {
    expect(buildResetUrl(TOKEN, "https://connect.example")).toBe(
      `https://connect.example/reset-password?token=${TOKEN}`,
    );
  });

  test("encodes the token so a stray character cannot inject a parameter", () => {
    expect(buildResetUrl("abc&admin=1", "https://connect.example")).toBe(
      "https://connect.example/reset-password?token=abc%26admin%3D1",
    );
  });
});

describe("buildPasswordResetEmail", () => {
  const url = buildResetUrl(TOKEN, "https://connect.example");
  const message = buildPasswordResetEmail(GRANT, url);

  test("addresses the account owner", () => {
    expect(message.to).toBe(GRANT.email);
    expect(message.text).toContain("Olá, Joana");
  });

  test("carries the reset link in both bodies", () => {
    expect(message.text).toContain(url);
    expect(message.html).toContain(`href="${url}"`);
  });

  test("states the validity window", () => {
    expect(message.text).toContain(`${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos`);
  });

  test("tells recipients who did not ask that they can ignore it", () => {
    expect(message.text).toContain("ignore esta mensagem");
  });

  test("escapes the display name in the HTML body", () => {
    const hostile = { ...GRANT, displayName: '<script>alert("x")</script>' };
    const html = buildPasswordResetEmail(hostile, url).html;

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
