// Messages the register flow sends back through ?error=. The URL is public, so
// the page shows only these and replaces anything else: otherwise anyone could
// craft a link that puts their own text in an alert on the real domain.

/** registerUser's answer for an e-mail already in use. Deliberately vague, so
 *  the form cannot be used to find out who has an account. */
export const REGISTER_CREATE_ERROR = "Não foi possível criar a conta com esses dados.";

export const REGISTER_FALLBACK_ERROR = "Não foi possível criar a conta. Confira os dados e tente de novo.";

export const RATE_LIMIT_ERROR = "Muitas tentativas. Aguarde alguns minutos.";

// Keep in sync with registerSchema's messages (schema.ts). A message missing
// here is not lost: the visitor sees the fallback instead.
const KNOWN_REGISTER_ERRORS = new Set<string>([
  REGISTER_CREATE_ERROR,
  RATE_LIMIT_ERROR,
  "Dados inválidos",
  "E-mail inválido",
  "A senha deve ter no mínimo 8 caracteres",
  "Senha muito longa",
  "Informe seu nome",
  "Nome muito longo",
  "É preciso aceitar o termo de consentimento para criar a conta",
]);

export interface RegisterError {
  message: string;
  /** True when the likely cause is an existing account: offer login and reset. */
  offerRecovery: boolean;
}

export function resolveRegisterError(raw: string | undefined): RegisterError | null {
  if (!raw) return null;
  if (!KNOWN_REGISTER_ERRORS.has(raw)) {
    return { message: REGISTER_FALLBACK_ERROR, offerRecovery: false };
  }
  return { message: raw, offerRecovery: raw === REGISTER_CREATE_ERROR };
}
