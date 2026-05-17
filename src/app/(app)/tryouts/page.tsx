import { requireUser } from "@/lib/auth/requireUser";
import { listCategories, listPackages } from "@/lib/packages/queries";
import { TryoutsCatalog } from "@/components/catalog/TryoutsCatalog";

export default async function TryoutsPage() {
  const { profile } = await requireUser();

  const [cats, packages] = await Promise.all([
    listCategories(),
    listPackages({ userId: profile.id }),
  ]);

  return <TryoutsCatalog categories={cats} packages={packages} />;
}
