"use server";

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

async function clientKey(scope: string): Promise<string> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${scope}:${ip}`;
}

function backTo(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

export async function loginAction(formData: FormData): Promise<void> {
  const next = String(formData.get("next") ?? "") || "/";
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    backTo("/login", parsed.error.issues[0]?.message ?? "Dados inválidos");
  }
  if (!checkRateLimit(await clientKey("login"), RATE_LIMITS.login)) {
    backTo("/login", "Muitas tentativas. Aguarde alguns minutos.");
  }

  const result = await authenticateUser(parsed.data);
  if (!result.ok || !result.userId) {
    backTo("/login", result.error ?? "E-mail ou senha incorretos.");
  }
  await createSession(result.userId);
  redirect(next.startsWith("/") ? next : "/");
}

export async function registerAction(formData: FormData): Promise<void> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    backTo("/register", parsed.error.issues[0]?.message ?? "Dados inválidos");
  }
  if (!checkRateLimit(await clientKey("register"), RATE_LIMITS.register)) {
    backTo("/register", "Muitas tentativas. Aguarde alguns minutos.");
  }

  const result = await registerUser(parsed.data);
  if (!result.ok || !result.userId) {
    backTo("/register", result.error ?? "Não foi possível criar a conta.");
  }
  await createSession(result.userId);
  redirect("/");
}

function backToForgotPassword(error: string, email: string): never {
  const params = new URLSearchParams({ error });
  if (email) params.set("email", email);
  redirect(`/forgot-password?${params}`);
}

function backToResetPassword(token: string, error: string): never {
  const params = new URLSearchParams({ token, error });
  redirect(`/reset-password?${params}`);
}

/**
 * Always ends on the same confirmation screen, whether or not the address has
 * an account: any difference in outcome would turn this form into an account
 * enumeration oracle. Delivery failures are logged by the mailer for the same
 * reason — surfacing them would only ever happen for real accounts.
 */
export async function forgotPasswordAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    backToForgotPassword(parsed.error.issues[0]?.message ?? "Dados inválidos", email);
  }

  const throttled =
    !checkRateLimit(await clientKey("forgot-password"), RATE_LIMITS.passwordReset) ||
    !checkRateLimit(
      `forgot-password:${parsed.data.email.toLowerCase().trim()}`,
      RATE_LIMITS.passwordReset,
    );
  if (throttled) {
    backToForgotPassword("Muitas tentativas. Aguarde alguns minutos.", email);
  }

  const grant = await createPasswordResetGrant(parsed.data);
  if (grant) {
    await sendPasswordResetEmail(grant);
  }
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
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
      backToForgotPassword(message, "");
    }
    backToResetPassword(token, message);
  }
  if (!checkRateLimit(await clientKey("reset-password"), RATE_LIMITS.passwordReset)) {
    backToResetPassword(token, "Muitas tentativas. Aguarde alguns minutos.");
  }

  const result = await resetPassword(parsed.data);
  if (!result.ok || !result.userId) {
    backToForgotPassword(result.error ?? "Link inválido ou expirado.", "");
  }

  // resetPassword revoked every existing session; this one is brand new.
  await createSession(result.userId);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
