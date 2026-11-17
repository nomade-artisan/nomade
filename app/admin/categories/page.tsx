import { getCategories } from "@/lib/categories/queries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import CategoriesTable from "@/components/admin/categories/CategoriesTable";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <Button asChild className="w-full sm:w-auto">
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
