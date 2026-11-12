import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { registerAction } from "@/modules/auth/actions";
import { resolveAuthError } from "@/modules/auth/auth-errors";
import { getConsentTerms, getSiteConfig } from "@/modules/settings/service";

export const metadata: Metadata = { title: "Criar conta" };

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const [{ error }, terms, config] = await Promise.all([
    searchParams,
    getConsentTerms(),
    getSiteConfig(),
  ]);

  return (
    <RegisterForm
      action={registerAction}
      termsText={terms.text}
      branding={config.branding}
      reviewsEnabled={config.features.reviewsEnabled}
      error={resolveAuthError("register", error)}
    />
  );
}
