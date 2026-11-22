"use client";

import { MemberPage } from "@/components/site/MemberPage";
import { useState } from "react";
import Link from "next/link";
import { authHref } from "@/modules/auth/destination";
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
  next?: string;
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
          <dt className="text-base font-bold">Avaliar</dt>
          <dd className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
            Dê de 1 a 5 estrelas a quem você contratou e conte como foi.
          </dd>
        </div>
      )}
      <div>
        <dt className="text-base font-bold">Anunciar</dt>
        <dd className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          Cadastre o seu serviço. Um administrador revisa o anúncio antes de ele aparecer na busca.
        </dd>
      </div>
    </dl>
  );
}

export function RegisterForm({ action, termsText, branding, reviewsEnabled, error, next }: RegisterFormProps) {
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
    <MemberPage
      title="Criar a sua conta"
      description={reviewsEnabled
        ? "Para buscar e ver contatos, não precisa de conta. Ela serve para avaliar e para anunciar."
        : "Para buscar e ver contatos, não precisa de conta. Ela serve para anunciar o seu serviço."}
      aside={(
        <aside className="member-page-aside" aria-label="O que a conta permite">
          <div className="card-stage hidden lg:block">{card(false)}</div>
          <div className="mt-10 border-t border-[var(--color-line)] pt-8">
            <AccountUses reviewsEnabled={reviewsEnabled} />
          </div>
        </aside>
      )}
    >
      {error && <AuthErrorBanner error={error} next={next} />}

      <form action={action} className="mt-6 flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
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
        {name.trim() && <div className="lg:hidden">{card(true)}</div>}
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
            className="terms-scroll max-h-56 overflow-y-auto whitespace-pre-line rounded-[var(--radius)] border border-[var(--color-line)] bg-white/80 p-4 text-sm leading-6 text-[var(--color-muted)] lg:max-h-36"
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
        <Link href={authHref("/login", next)} className={linkClass}>
          Entrar
        </Link>
      </p>
    </MemberPage>
  );
}
