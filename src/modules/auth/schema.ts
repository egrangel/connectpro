import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("E-mail inválido").max(254),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(128, "Senha muito longa"),
  displayName: z
    .string()
    .trim()
    .min(2, "Informe seu nome")
    .max(80, "Nome muito longo"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("E-mail inválido").max(254),
  password: z.string().min(1, "Informe a senha").max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido").max(254),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// The token is validated by shape here so a malformed link fails before any
// database lookup; authenticity is decided by the hash comparison in the service.
export const resetPasswordSchema = z
  .object({
    token: z.string().regex(/^[0-9a-f]{64}$/, "Link inválido ou expirado."),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .max(128, "Senha muito longa"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "As senhas não conferem",
    path: ["passwordConfirm"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
