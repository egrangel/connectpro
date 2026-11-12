import Link from "next/link";
import type { Metadata } from "next";
import { inputClass, primaryButtonClass } from "@/components/ui/form-classes";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { loginAction } from "@/modules/auth/actions";
import { resolveAuthError } from "@/modules/auth/auth-errors";

export const metadata: Metadata = { title: "Entrar" };

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error: rawError, next } = await searchParams;
  const error = resolveAuthError("login", rawError);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card-surface rounded-[calc(var(--radius)+10px)] p-6 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Entre para avaliar profissionais e gerenciar seus anúncios.
        </p>

        {error && <AuthErrorBanner error={error} />}

        <form action={loginAction} className="mt-7 flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            E-mail
            <input type="email" name="email" required autoComplete="email" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            <span className="flex items-center justify-between gap-3">
              Senha
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                Esqueci minha senha
              </Link>
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          <button type="submit" className={primaryButtonClass}>
            Entrar
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-bold text-[var(--color-primary)] hover:underline">
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </div>
  );
}