import Link from "next/link";
import type { Metadata } from "next";
import { inputClass, primaryButtonClass } from "@/components/ui/form-classes";
import { registerAction } from "@/modules/auth/actions";
import { getConsentTerms } from "@/modules/settings/service";

export const metadata: Metadata = { title: "Criar conta" };

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const [{ error }, terms] = await Promise.all([searchParams, getConsentTerms()]);

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

          <fieldset className="mt-1 flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">Termo de consentimento</legend>
            <div
              // Scrollable rather than truncated: the whole agreement has to be
              // readable on the page where it is accepted.
              tabIndex={0}
              role="region"
              aria-label="Termo de consentimento"
              className="max-h-56 overflow-y-auto whitespace-pre-line rounded-[var(--radius)] border border-[var(--color-line)] bg-white/70 p-4 text-xs leading-6 text-[var(--color-muted)]"
            >
              {terms.text}
            </div>
            <label className="flex items-start gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                name="acceptTerms"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
              />
              <span>Li e aceito o termo de consentimento acima. *</span>
            </label>
          </fieldset>

          {error && <p className="text-sm font-bold text-red-600">{error}</p>}

          <button type="submit" className={primaryButtonClass}>
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