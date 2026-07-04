import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ROLES } from "@/lib/constants";
import type { LoginInput, RegisterInput } from "./schema";

export interface AuthResult {
  ok: boolean;
  userId?: string;
  error?: string;
}

const GENERIC_LOGIN_ERROR = "E-mail ou senha incorretos.";

/**
 * Always creates a USER — role is deliberately not an input anywhere in the
 * registration path. Admins are promoted via seed script or by another admin.
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Não foi possível criar a conta com esses dados." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      displayName: input.displayName,
      passwordHash: await hashPassword(input.password),
      role: ROLES.USER,
    },
  });
  return { ok: true, userId: user.id };
}

export async function authenticateUser(input: LoginInput): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }
  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }
  return { ok: true, userId: user.id };
}
