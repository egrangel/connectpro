import Link from "next/link";
import type { Metadata } from "next";
import { ListingForm } from "@/components/listings/ListingForm";
import { requireUser } from "@/lib/auth/session";
import { listActiveCategories } from "@/modules/categories/service";
import { saveOwnListingAction } from "../actions";

export const metadata: Metadata = { title: "Novo anúncio" };

interface NewOwnListingPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewOwnListingPage({ searchParams }: NewOwnListingPageProps) {
  const [{ error }, , categories] = await Promise.all([
    searchParams,
    requireUser(),
    listActiveCategories(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/meus-anuncios"
        className="text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-primary)]"
      >
        ← Meus anúncios
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Novo anúncio</h1>
      <p className="mt-1 mb-6 text-sm text-[var(--color-muted)]">
        Preencha os dados e salve. O anúncio fica em análise e só aparece no site
        depois que a nossa equipe aprovar. As fotos são enviadas na tela seguinte.
      </p>

      <ListingForm
        categories={categories}
        error={error}
        action={saveOwnListingAction}
        canChangeStatus={false}
      />
    </div>
  );
}
