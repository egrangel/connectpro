import Link from "next/link";
import type { Metadata } from "next";
import { loginAction } from "@/modules/auth/actions";

export const metadata: Metadata = { title: "Entrar" };

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-black/55">
        Acesse sua conta para avaliar profissionais.
      </p>

      <form action={loginAction} className="mt-8 flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
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
            autoComplete="current-password"
            className="rounded-[var(--radius)] border border-black/10 bg-white px-3 py-2.5 font-normal outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          className="mt-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Entrar
        </button>
      </form>

      <p className="mt-6 text-sm text-black/60">
        Ainda não tem conta?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-primary)] hover:underline">
          Criar conta gratuita
        </Link>
      </p>
    </div>
  );
}
