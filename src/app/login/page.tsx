import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { MemberPage } from "@/components/site/MemberPage";
import { authDestination } from "@/modules/auth/destination";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <MemberPage title="Entrar" description="Entre para avaliar profissionais e gerenciar seus anúncios.">
      <LoginForm next={authDestination(next)} initialError={error} />
    </MemberPage>
  );
}
