import CategoryForm from "@/components/admin/categories/CategoryForm";
import { getCollections } from "@/lib/collections/queries";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle catégorie</h1>
      <CategoryForm collections={collections} />
    </div>
  );
}