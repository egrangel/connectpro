"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { inputClass, primaryButtonClass } from "@/components/ui/form-classes";
import { MemberCard } from "@/components/auth/MemberCard";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import type { AuthError } from "@/modules/auth/auth-errors";
import type { BrandingConfig } from "@/modules/settings/schema";

interface RegisterFormProps {
  action: (formData: FormData) => Promise<void>;
  termsText: string;
  branding: BrandingConfig;
  reviewsEnabled: boolean;
  error: AuthError | null;
}

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;
const PASSWORD_MIN_LENGTH = 8;

const linkClass = "font-bold text-[var(--color-primary)] hover:underline";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0`}
    >
      {pending ? "Criando conta…" : "Criar conta"}
    </button>
  );
}

/** What the account is for. Plain text, shown beside the card on desktop and
 *  under the form on phones, so both audiences read it everywhere. */
function AccountUses({ reviewsEnabled }: { reviewsEnabled: boolean }) {
  return (
    <dl className="grid gap-5 xl:grid-cols-2 xl:gap-8">
      {reviewsEnabled && (
        <div>
          <dt className="text-[0.95rem] font-bold">Avaliar</dt>
          <dd className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
            Dê de 1 a 5 estrelas a quem você contratou e conte como foi.
          </dd>
        </div>
      )}
      <div>
        <dt className="text-[0.95rem] font-bold">Anunciar</dt>
        <dd className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          Cadastre o seu serviço. Um administrador revisa o anúncio antes de ele aparecer na busca.
        </dd>
      </div>
    </dl>
  );
}

export function RegisterForm({ action, termsText, branding, reviewsEnabled, error }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [isNameFocused, setIsNameFocused] = useState(false);

  const card = (compact: boolean) => (
    <MemberCard
      name={name}
      branding={branding}
      reviewsEnabled={reviewsEnabled}
      isActive={isNameFocused}
      compact={compact}
    />
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:py-10 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:gap-16">
      {/* Phones get a compact card above the form; it is decorative, so the
          form stays first for assistive tech either way. */}
      <div className="order-first lg:hidden">{card(true)}</div>

      <div className="min-w-0">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-[2.75rem] sm:leading-[1.05]">
          Criar a sua conta
        </h1>
        <p className="mt-3 max-w-md text-base leading-7 text-[var(--color-muted)]">
          Para buscar e ver contatos, não precisa de conta.{" "}
          {reviewsEnabled ? "Ela serve para avaliar e para anunciar." : "Ela serve para anunciar o seu serviço."}
        </p>

        {error && <AuthErrorBanner error={error} />}

        <form action={action} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Nome
            <input
              type="text"
              name="displayName"
              required
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
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
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
              aria-describedby="password-hint"
              className={inputClass}
            />
            <span id="password-hint" className="text-xs font-normal text-[var(--color-muted)]">
              Pelo menos {PASSWORD_MIN_LENGTH} caracteres.
            </span>
          </label>

          <fieldset className="mt-1 flex flex-col gap-2.5">
            <legend className="mb-2 text-sm font-bold">Termo de consentimento</legend>
            <div
              // Scrollable rather than truncated: the whole agreement has to be
              // readable on the page where it is accepted. Shorter on desktop
              // so the accept box and button stay in the first screen.
              tabIndex={0}
              role="region"
              aria-label="Termo de consentimento"
              className="terms-scroll max-h-56 overflow-y-auto whitespace-pre-line rounded-[var(--radius)] border border-[var(--color-line)] bg-white/80 p-4 text-[0.8rem] leading-6 text-[var(--color-muted)] lg:max-h-36"
            >
              {termsText}
            </div>
            <label className="flex items-start gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                name="acceptTerms"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
              />
              <span>Li e aceito o termo de consentimento acima.</span>
            </label>
          </fieldset>

          <SubmitButton />
        </form>

        <p className="mt-5 text-sm text-[var(--color-muted)]">
          Já tem conta?{" "}
          <Link href="/login" className={linkClass}>
            Entrar
          </Link>
        </p>

        <div className="mt-10 border-t border-[var(--color-line)] pt-8 lg:hidden">
          <AccountUses reviewsEnabled={reviewsEnabled} />
        </div>
      </div>

      {/* Sticks beside the form, so the card stays in view while the visitor
          scrolls through the agreement. */}
      <aside className="hidden h-fit lg:sticky lg:top-28 lg:block lg:pt-4" aria-label="O que a conta permite">
        <div className="card-stage">{card(false)}</div>
        <div className="mt-10 border-t border-[var(--color-line)] pt-8">
          <AccountUses reviewsEnabled={reviewsEnabled} />
        </div>
      </aside>
    </div>
  );
}
