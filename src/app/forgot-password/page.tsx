import Link from "next/link";
import type { Metadata } from "next";
import { inputClass, primaryButtonClass } from "@/components/ui/form-classes";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/lib/constants";
import { forgotPasswordAction } from "@/modules/auth/actions";

export const metadata: Metadata = { title: "Esqueci minha senha" };

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; sent?: string; email?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error, sent, email } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card-surface rounded-[calc(var(--radius)+10px)] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase text-[var(--color-primary)]">Recuperar acesso</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Esqueci minha senha</h1>

        {sent ? (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
              Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha.
              Confira sua caixa de entrada e o spam — o link vale por{" "}
              {PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-block font-bold text-[var(--color-primary)] hover:underline"
            >
              Voltar para o login
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.
            </p>

            <form action={forgotPasswordAction} className="mt-7 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                E-mail
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  defaultValue={email ?? ""}
                  className={inputClass}
                />
              </label>

              {error && <p className="text-sm font-bold text-red-600">{error}</p>}

              <button type="submit" className={primaryButtonClass}>
                Enviar link de recuperação
              </button>
            </form>

            <p className="mt-6 text-sm text-[var(--color-muted)]">
              Lembrou a senha?{" "}
              <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
