"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inputClass, primaryButtonClass } from "@/components/ui/form-classes";
import { loginAction } from "@/modules/auth/actions";
import { resolveAuthError } from "@/modules/auth/auth-errors";
import { authHref, type LoginState } from "@/modules/auth/destination";
import { AuthErrorBanner } from "./AuthErrorBanner";

const initialState: LoginState = {};

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const error = resolveAuthError("login", state.error ?? initialError);

  return (
    <>
      {error && <AuthErrorBanner error={error} next={next} />}

      <form action={action} className="mt-7 flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          E-mail
          <input type="email" name="email" defaultValue={state.email} required autoComplete="email" className={inputClass} />
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-bold">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password">Senha</label>
            <Link
              href={authHref("/forgot-password", next)}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={pending} className={primaryButtonClass}>
          Entrar
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Ainda não tem conta?{" "}
        <Link href={authHref("/register", next)} className="font-bold text-[var(--color-primary)] hover:underline">
          Criar conta gratuita
        </Link>
      </p>
    </>
  );
}
