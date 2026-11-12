import { listActiveCategories } from "@/modules/categories/service";
import { ListingForm } from "@/components/listings/ListingForm";
import { saveListingAction } from "../actions";

// Save errors come back through the form's own state, so this page reads
// nothing from the URL: a ?error= here could only be someone else's text.
export default async function NewListingPage() {
  const categories = await listActiveCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Novo anúncio</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Preencha os dados, escolha o status e salve. Como rascunho o anúncio não
        aparece no site; as fotos são enviadas na tela seguinte.
      </p>
      <ListingForm categories={categories} action={saveListingAction} />
    </div>
  );
}
