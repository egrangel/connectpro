import { escapeHtml, sendMail, type MailMessage, type MailResult } from "@/lib/mail/mailer";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/lib/constants";
import { resolveBaseUrl } from "@/lib/url";
import type { PasswordResetGrant } from "./service";

const SUBJECT = "Redefinição de senha — Connect";

export function buildResetUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

/** Pure message builder — no I/O, so the copy and the link stay testable. */
export function buildPasswordResetEmail(
  grant: Pick<PasswordResetGrant, "email" | "displayName">,
  resetUrl: string,
): MailMessage {
  const greeting = `Olá, ${grant.displayName}`;
  const validity = `O link vale por ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos e só pode ser usado uma vez.`;
  const ignore =
    "Se você não pediu a redefinição, ignore esta mensagem — sua senha atual continua valendo.";

  const text = [
    `${greeting},`,
    "",
    "Recebemos um pedido para redefinir a senha da sua conta no Connect.",
    "Abra o endereço abaixo para escolher uma nova senha:",
    "",
    resetUrl,
    "",
    validity,
    ignore,
  ].join("\n");

  const html = [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#1f2430">',
    `<p>${escapeHtml(greeting)},</p>`,
    "<p>Recebemos um pedido para redefinir a senha da sua conta no Connect.</p>",
    `<p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#2f6bff;color:#ffffff;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none">Redefinir minha senha</a></p>`,
    `<p style="color:#5b6272;font-size:13px">${escapeHtml(validity)}</p>`,
    `<p style="color:#5b6272;font-size:13px">${escapeHtml(ignore)}</p>`,
    "</div>",
  ].join("");

  return { to: grant.email, subject: SUBJECT, text, html };
}

export async function sendPasswordResetEmail(grant: PasswordResetGrant): Promise<MailResult> {
  const baseUrl = resolveBaseUrl({
    APP_BASE_URL: process.env.APP_BASE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  });
  return sendMail(buildPasswordResetEmail(grant, buildResetUrl(grant.token, baseUrl)));
}
