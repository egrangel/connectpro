import Link from "next/link";
import type { AuthError } from "@/modules/auth/auth-errors";

interface AuthErrorBannerProps {
  error: AuthError;
}

const hintLinkClass = "font-bold underline underline-offset-2";

/** The one error panel the account pages share. The message comes from
 *  resolveAuthError, never straight from the URL. */
export function AuthErrorBanner({ error }: AuthErrorBannerProps) {
  return (
    <div
      role="alert"
      className="mt-5 rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p className="font-semibold">{error.message}</p>
      {error.hint === "has-account" && (
        <p className="mt-1">
          Se você já tem conta,{" "}
          <Link href="/login" className={hintLinkClass}>
            entre
          </Link>{" "}
          ou{" "}
          <Link href="/forgot-password" className={hintLinkClass}>
            recupere a senha
          </Link>
          .
        </p>
      )}
      {error.hint === "forgot-password" && (
        <p className="mt-1">
          Esqueceu a senha?{" "}
          <Link href="/forgot-password" className={hintLinkClass}>
            Crie uma nova
          </Link>
          .
        </p>
      )}
    </div>
  );
}
