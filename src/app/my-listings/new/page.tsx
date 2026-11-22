import { MemberPage } from "@/components/site/MemberPage";
import type { Metadata } from "next";
import { ListingForm } from "@/components/listings/ListingForm";
import { requireUser } from "@/lib/auth/session";
import { listActiveCategories } from "@/modules/categories/service";
import { canPublishListing } from "@/modules/listings/authorization";
import { saveOwnListingAction } from "../actions";

export const metadata: Metadata = { title: "Novo anúncio" };

// Save errors come back through the form's own state, so this page reads
// nothing from the URL: a ?error= here could only be someone else's text.
export default async function NewOwnListingPage() {
  const [user, categories] = await Promise.all([requireUser(), listActiveCategories()]);

  // An admin reaching this page from the site header is still an admin: they
  // pick the status here instead of publishing their own listing from /admin.
  const canChangeStatus = canPublishListing(user);

  return (
    <MemberPage
      title="Novo anúncio"
      backToListings
      description={canChangeStatus
        ? "Preencha os dados, escolha o status e salve. As fotos são enviadas na tela seguinte."
        : "Preencha os dados e salve. O anúncio fica em análise e as fotos são enviadas na tela seguinte."}
    >
      <ListingForm
        categories={categories}
        action={saveOwnListingAction}
        canChangeStatus={canChangeStatus}
        variant="site"
      />
    </MemberPage>
  );
}
