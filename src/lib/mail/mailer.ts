// Two mail drivers behind one interface, mirroring the media storage split
// (src/modules/media/storage.ts):
// - Resend HTTP API when RESEND_API_KEY is set (production/Vercel). Plain
//   `fetch`, no SDK dependency.
// - Console driver otherwise (development): the message — including any link —
//   is printed to the server log so local flows are testable without a
//   provider account.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Connect <onboarding@resend.dev>";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailResult {
  ok: boolean;
  error?: string;
}

export function isMailProviderConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress(): string {
  return process.env.MAIL_FROM?.trim() || DEFAULT_FROM;
}

async function sendWithResend(message: MailMessage): Promise<MailResult> {
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });

    if (!response.ok) {
      // Body may carry the provider's reason; log it server-side only.
      const detail = await response.text().catch(() => "");
      console.error(`[mail] Resend responded ${response.status}: ${detail}`);
      return { ok: false, error: "Falha ao enviar o e-mail." };
    }
    return { ok: true };
  } catch (error: unknown) {
    console.error("[mail] Resend request failed", error);
    return { ok: false, error: "Falha ao enviar o e-mail." };
  }
}

function sendToConsole(message: MailMessage): MailResult {
  console.info(
    [
      "[mail] No RESEND_API_KEY set — printing message instead of sending.",
      `  to:      ${message.to}`,
      `  subject: ${message.subject}`,
      message.text
        .split("\n")
        .map((line) => `  | ${line}`)
        .join("\n"),
    ].join("\n"),
  );
  return { ok: true };
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  if (isMailProviderConfigured()) {
    return sendWithResend(message);
  }
  return sendToConsole(message);
}

/** Escapes interpolation into the HTML bodies built in this app. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
