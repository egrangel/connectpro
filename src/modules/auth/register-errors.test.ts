import { describe, expect, test } from "vitest";
import {
  REGISTER_CREATE_ERROR,
  REGISTER_FALLBACK_ERROR,
  resolveRegisterError,
} from "./register-errors";

describe("resolveRegisterError", () => {
  test("returns nothing when there is no error", () => {
    expect(resolveRegisterError(undefined)).toBeNull();
    expect(resolveRegisterError("")).toBeNull();
  });

  test("shows a known validation message as is", () => {
    expect(resolveRegisterError("Informe seu nome")).toEqual({
      message: "Informe seu nome",
      offerRecovery: false,
    });
  });

  test("offers login and password recovery for the generic create failure", () => {
    expect(resolveRegisterError(REGISTER_CREATE_ERROR)).toEqual({
      message: REGISTER_CREATE_ERROR,
      offerRecovery: true,
    });
  });

  test("replaces text that did not come from the register flow", () => {
    // ?error= is part of the URL, so anyone can put text there; the page must
    // never display it on the real domain.
    expect(resolveRegisterError("Sua conta foi bloqueada, ligue para 0800")).toEqual({
      message: REGISTER_FALLBACK_ERROR,
      offerRecovery: false,
    });
  });
});
