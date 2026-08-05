import Link from "next/link";
import type { Metadata } from "next";
import { inputClass, primaryButtonClass } from "@/components/ui/form-classes";
import { isResetTokenFormat } from "@/lib/auth/reset-token";
import { resetPasswordAction } from "@/modules/auth/actions";

export const metadata: Metadata = { title: "Nova senha" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams;
  // Shape check only — whether the token is real (and unexpired) is decided by
  // the server action, so this page never confirms a token's validity.
  const hasUsableToken = Boolean(token && isResetTokenFormat(token));

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card-surface rounded-[calc(var(--radius)+10px)] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase text-[var(--color-primary)]">Recuperar acesso</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Criar nova senha</h1>

        {hasUsableToken ? (
          <>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Escolha uma senha de no mínimo 8 caracteres. Ao concluir, todas as sessões abertas
              nesta conta serão encerradas.
            </p>

            <form action={resetPasswordAction} className="mt-7 flex flex-col gap-4">
              <input type="hidden" name="token" value={token} />
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Nova senha
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Confirmar nova senha
                <input
                  type="password"
                  name="passwordConfirm"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </label>

              {error && <p className="text-sm font-bold text-red-600">{error}</p>}

              <button type="submit" className={primaryButtonClass}>
                Salvar nova senha
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
              Este link de redefinição é inválido ou já expirou. Peça um novo para continuar.
            </p>
            <Link
              href="/forgot-password"
              className="mt-7 inline-block font-bold text-[var(--color-primary)] hover:underline"
            >
              Solicitar novo link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
