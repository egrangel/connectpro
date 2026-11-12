// Messages the account flows send back through ?error=. The URL is public, so
// each page shows only its own flow's messages and replaces anything else:
// otherwise anyone could craft a link that puts their own text in an alert on
// the real domain.

export type AuthFlow = "register" | "login" | "forgotPassword" | "resetPassword";

/** A follow-up line offered under the message when the likely way out is known. */
export type AuthErrorHint = "has-account" | "forgot-password" | null;

export interface AuthError {
  message: string;
  hint: AuthErrorHint;
}

export const RATE_LIMIT_ERROR = "Muitas tentativas. Aguarde alguns minutos.";
const INVALID_DATA_ERROR = "Dados inválidos";

/** registerUser's answer for an e-mail already in use. Deliberately vague, so
 *  the form cannot be used to find out who has an account. */
export const REGISTER_CREATE_ERROR = "Não foi possível criar a conta com esses dados.";

/** authenticateUser's answer for any failed login, for the same reason. */
export const GENERIC_LOGIN_ERROR = "E-mail ou senha incorretos.";

/** resetPassword's answer for an unknown, used or expired token. */
export const INVALID_RESET_ERROR = "Link inválido ou expirado. Solicite um novo.";

/** resetPasswordSchema's message for a token with the wrong shape. */
export const INVALID_LINK_ERROR = "Link inválido ou expirado.";

export const AUTH_FALLBACK_ERROR: Record<AuthFlow, string> = {
  register: "Não foi possível criar a conta. Confira os dados e tente de novo.",
  login: "Não foi possível entrar. Confira os dados e tente de novo.",
  forgotPassword: "Não foi possível enviar o link. Confira o e-mail e tente de novo.",
  resetPassword: "Não foi possível salvar a nova senha. Tente de novo.",
};

// Keep in sync with schema.ts; auth-errors.test.ts fails when a schema message
// is missing here. A message missing in production is not lost: the visitor
// sees the flow's fallback instead.
const KNOWN_ERRORS: Record<AuthFlow, ReadonlySet<string>> = {
  register: new Set([
    REGISTER_CREATE_ERROR,
    RATE_LIMIT_ERROR,
    INVALID_DATA_ERROR,
    "E-mail inválido",
    "A senha deve ter no mínimo 8 caracteres",
    "Senha muito longa",
    "Informe seu nome",
    "Nome muito longo",
    "É preciso aceitar o termo de consentimento para criar a conta",
  ]),
  login: new Set([GENERIC_LOGIN_ERROR, RATE_LIMIT_ERROR, INVALID_DATA_ERROR, "E-mail inválido", "Informe a senha"]),
  // The reset action sends invalid-link failures here, because a bad link
  // cannot be fixed on the reset form: the visitor has to ask for a new one.
  forgotPassword: new Set([
    RATE_LIMIT_ERROR,
    INVALID_DATA_ERROR,
    "E-mail inválido",
    INVALID_LINK_ERROR,
    INVALID_RESET_ERROR,
  ]),
  resetPassword: new Set([
    RATE_LIMIT_ERROR,
    INVALID_DATA_ERROR,
    "A senha deve ter no mínimo 8 caracteres",
    "Senha muito longa",
    "As senhas não conferem",
  ]),
};

const HINTS: Partial<Record<AuthFlow, Record<string, AuthErrorHint>>> = {
  register: { [REGISTER_CREATE_ERROR]: "has-account" },
  login: { [GENERIC_LOGIN_ERROR]: "forgot-password" },
};

export function resolveAuthError(flow: AuthFlow, raw: string | undefined): AuthError | null {
  if (!raw) return null;
  if (!KNOWN_ERRORS[flow].has(raw)) {
    return { message: AUTH_FALLBACK_ERROR[flow], hint: null };
  }
  return { message: raw, hint: HINTS[flow]?.[raw] ?? null };
}
