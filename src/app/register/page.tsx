import { authDestination } from "@/modules/auth/destination";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { registerAction } from "@/modules/auth/actions";
import { resolveAuthError } from "@/modules/auth/auth-errors";
import { getConsentTerms, getSiteConfig } from "@/modules/settings/service";

export const metadata: Metadata = { title: "Criar conta" };

interface RegisterPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const [{ error, next }, terms, config] = await Promise.all([
    searchParams,
    getConsentTerms(),
    getSiteConfig(),
  ]);

  return (
    <RegisterForm
      action={registerAction}
      next={authDestination(next)}
      termsText={terms.text}
      branding={config.branding}
      reviewsEnabled={config.features.reviewsEnabled}
      error={resolveAuthError("register", error)}
    />
  );
}
