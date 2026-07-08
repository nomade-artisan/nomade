import { getCategories } from "@/lib/shipping/categories/queries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import CategoriesTable from "@/components/admin/categories/CategoriesTable";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Link>
        </Button>
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}