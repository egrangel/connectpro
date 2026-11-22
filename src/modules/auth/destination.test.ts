import { describe, expect, test } from "vitest";
import { authDestination, authHref } from "./destination";
import { buildResetUrl } from "./reset-email";

describe("auth return destinations", () => {
  test.each([
    "https://external.example",
    "//external.example",
    "/\\external.example",
    "/foo/..//external.example",
    "/\texternal.example",
  ])("rejects %s", (destination) => {
    expect(authDestination(destination)).toBeUndefined();
  });

  test("keeps the task through sign-up and the reset email", () => {
    const next = "/p/ana#avaliacoes";
    expect(new URL(authHref("/register", next), "https://connect.test").searchParams.get("next")).toBe(next);
    const reset = new URL(buildResetUrl("one-time-token", "https://connect.test", next));
    expect(reset.searchParams.get("next")).toBe(next);
    expect(reset.searchParams.get("token")).toBe("one-time-token");
  });
});
