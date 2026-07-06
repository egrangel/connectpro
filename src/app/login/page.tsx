import Link from "next/link";
import type { Metadata } from "next";
import { loginAction } from "@/modules/auth/actions";

export const metadata: Metadata = { title: "Entrar" };

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--color-line)] bg-white/86 px-3 py-2.5 font-normal outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card-surface rounded-[calc(var(--radius)+10px)] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase text-[var(--color-primary)]">Acesso</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Entrar</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Acesse sua conta para avaliar profissionais.
        </p>

        <form action={loginAction} className="mt-7 flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            E-mail
            <input type="email" name="email" required autoComplete="email" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Senha
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-3 font-bold text-white shadow-[0_14px_30px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          Ainda nao tem conta?{" "}
          <Link href="/register" className="font-bold text-[var(--color-primary)] hover:underline">
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </div>
  );
}