import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  generateResetToken,
  hashResetToken,
  isResetTokenExpired,
  isResetTokenFormat,
  resetTokenExpiry,
} from "@/lib/auth/reset-token";
import { ROLES } from "@/lib/constants";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./schema";

export interface AuthResult {
  ok: boolean;
  userId?: string;
  error?: string;
}

/** What the caller needs to deliver a reset link; null when nothing should be sent. */
export interface PasswordResetGrant {
  email: string;
  displayName: string;
  token: string;
  expiresAt: Date;
}

const GENERIC_LOGIN_ERROR = "E-mail ou senha incorretos.";
const INVALID_RESET_ERROR = "Link inválido ou expirado. Solicite um novo.";

/**
 * Always creates a USER — role is deliberately not an input anywhere in the
 * registration path. Admins are promoted via seed script or by another admin.
 *
 * Acceptance of the consent agreement is stamped here rather than defaulted in
 * the schema: the column exists to record that a person agreed, so it is only
 * ever written on a path that checked they did.
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
      termsAcceptedAt: new Date(),
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

/**
 * Issues a single-use reset grant, or null when the address has no active
 * account. Callers must show the same confirmation either way — the return
 * value is a delivery instruction, never a signal to the visitor about whether
 * the address is registered.
 *
 * Any outstanding grant for the user is dropped first, so the newest link is
 * the only one that works.
 */
export async function createPasswordResetGrant(
  input: ForgotPasswordInput,
): Promise<PasswordResetGrant | null> {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return null;
  }

  const token = generateResetToken();
  const expiresAt = resetTokenExpiry();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { tokenHash: hashResetToken(token), userId: user.id, expiresAt },
    }),
  ]);

  return { email: user.email, displayName: user.displayName, token, expiresAt };
}

/**
 * Redeems a reset link: sets the new password, burns every outstanding grant
 * and revokes all existing sessions, so a stolen session cookie does not
 * survive the reset. The caller signs the user back in.
 */
export async function resetPassword(input: ResetPasswordInput): Promise<AuthResult> {
  if (!isResetTokenFormat(input.token)) {
    return { ok: false, error: INVALID_RESET_ERROR };
  }

  const grant = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(input.token) },
    include: { user: true },
  });

  if (!grant || isResetTokenExpired(grant.expiresAt) || !grant.user.isActive) {
    return { ok: false, error: INVALID_RESET_ERROR };
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: grant.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: grant.userId } }),
    prisma.session.deleteMany({ where: { userId: grant.userId } }),
  ]);

  return { ok: true, userId: grant.userId };
}
