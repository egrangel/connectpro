import { listActiveCategories } from "@/modules/categories/service";
import { ListingForm } from "../ListingForm";

interface NewListingPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const [{ error }, categories] = await Promise.all([
    searchParams,
    listActiveCategories(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Novo anúncio</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Salve como rascunho primeiro para poder adicionar fotos.
      </p>
      <ListingForm categories={categories} error={error} />
    </div>
  );
}
