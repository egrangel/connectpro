"use server";

import { authDestination, authHref, type LoginState } from "./destination";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./schema";
import {
  authenticateUser,
  createPasswordResetGrant,
  registerUser,
  resetPassword,
} from "./service";
import { sendPasswordResetEmail } from "./reset-email";
import { INVALID_LINK_ERROR, RATE_LIMIT_ERROR } from "./auth-errors";

async function clientKey(scope: string): Promise<string> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${scope}:${ip}`;
}

function backTo(path: string, error: string, next?: string): never {
  redirect(authHref(path, next, { error }));
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const next = authDestination(formData.get("next"));
  const email = String(formData.get("email") ?? "").slice(0, 254);
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });

  if (!parsed.success) return { email, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  if (!checkRateLimit(await clientKey("login"), RATE_LIMITS.login)) return { email, error: RATE_LIMIT_ERROR };

  const result = await authenticateUser(parsed.data);
  if (!result.ok || !result.userId) return { email, error: result.error ?? "E-mail ou senha incorretos." };

  await createSession(result.userId);
  redirect(next ?? "/");
}

export async function registerAction(formData: FormData): Promise<void> {
  const next = authDestination(formData.get("next"));
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    // An unchecked box sends nothing at all, which is exactly the case the
    // schema must reject.
    acceptedTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) {
    backTo("/register", parsed.error.issues[0]?.message ?? "Dados inválidos", next);
  }
  if (!checkRateLimit(await clientKey("register"), RATE_LIMITS.register)) {
    backTo("/register", RATE_LIMIT_ERROR, next);
  }

  const result = await registerUser(parsed.data);
  if (!result.ok || !result.userId) {
    backTo("/register", result.error ?? "Não foi possível criar a conta.", next);
  }
  await createSession(result.userId);
  redirect(next ?? "/");
}

function backToForgotPassword(error: string, email: string, next?: string): never {
  redirect(authHref("/forgot-password", next, email ? { error, email } : { error }));
}

function backToResetPassword(token: string, error: string, next?: string): never {
  redirect(authHref("/reset-password", next, { token, error }));
}

/**
 * Always ends on the same confirmation screen, whether or not the address has
 * an account: any difference in outcome would turn this form into an account
 * enumeration oracle. Delivery failures are logged by the mailer for the same
 * reason — surfacing them would only ever happen for real accounts.
 */
export async function forgotPasswordAction(formData: FormData): Promise<void> {
  const next = authDestination(formData.get("next"));
  const email = String(formData.get("email") ?? "");
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    backToForgotPassword(parsed.error.issues[0]?.message ?? "Dados inválidos", email, next);
  }

  const throttled =
    !checkRateLimit(await clientKey("forgot-password"), RATE_LIMITS.passwordReset) ||
    !checkRateLimit(
      `forgot-password:${parsed.data.email.toLowerCase().trim()}`,
      RATE_LIMITS.passwordReset,
    );
  if (throttled) {
    backToForgotPassword(RATE_LIMIT_ERROR, email, next);
  }

  const grant = await createPasswordResetGrant(parsed.data);
  if (grant) {
    await sendPasswordResetEmail(grant, next);
  }
  redirect(authHref("/forgot-password", next, { sent: "1" }));
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const next = authDestination(formData.get("next"));
  const token = String(formData.get("token") ?? "");
  const parsed = resetPasswordSchema.safeParse({
    token,
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message = issue?.message ?? "Dados inválidos";
    // A bad token cannot be fixed on the reset form — send them to request a new link.
    if (issue?.path[0] === "token") {
      backToForgotPassword(message, "", next);
    }
    backToResetPassword(token, message, next);
  }
  if (!checkRateLimit(await clientKey("reset-password"), RATE_LIMITS.passwordReset)) {
    backToResetPassword(token, RATE_LIMIT_ERROR, next);
  }

  const result = await resetPassword(parsed.data);
  if (!result.ok || !result.userId) {
    backToForgotPassword(result.error ?? INVALID_LINK_ERROR, "", next);
  }

  // resetPassword revoked every existing session; this one is brand new.
  await createSession(result.userId);
  redirect(next ?? "/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
