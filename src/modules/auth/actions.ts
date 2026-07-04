"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "./schema";
import { authenticateUser, registerUser } from "./service";

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

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
