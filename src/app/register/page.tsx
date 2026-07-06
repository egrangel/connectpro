import Link from "next/link";
import type { Metadata } from "next";
import { registerAction } from "@/modules/auth/actions";

export const metadata: Metadata = { title: "Criar conta" };

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--color-line)] bg-white/86 px-3 py-2.5 font-normal outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]";

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card-surface rounded-[calc(var(--radius)+10px)] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase text-[var(--color-primary)]">Conta gratuita</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Criar conta</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Use sua conta para avaliar profissionais. Navegar nao exige cadastro.
        </p>

        <form action={registerAction} className="mt-7 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Nome
            <input
              type="text"
              name="displayName"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              className={inputClass}
            />
          </label>
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
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-3 font-bold text-white shadow-[0_14px_30px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          Ja tem conta?{" "}
          <Link href="/login" className="font-bold text-[var(--color-primary)] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}