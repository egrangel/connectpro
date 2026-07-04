import Link from "next/link";
import type { Metadata } from "next";
import { registerAction } from "@/modules/auth/actions";

export const metadata: Metadata = { title: "Criar conta" };

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
      <p className="mt-1 text-sm text-black/55">
        Conta gratuita para avaliar profissionais. Navegar não exige cadastro.
      </p>

      <form action={registerAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Nome
          <input
            type="text"
            name="displayName"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="rounded-[var(--radius)] border border-black/10 bg-white px-3 py-2.5 font-normal outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-[var(--radius)] border border-black/10 bg-white px-3 py-2.5 font-normal outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Senha
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-[var(--radius)] border border-black/10 bg-white px-3 py-2.5 font-normal outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Criar conta
        </button>
      </form>

      <p className="mt-6 text-sm text-black/60">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
