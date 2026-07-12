import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CollectionsTable from "@/components/admin/collections/CollectionsTable";
import { getCollections } from "@/lib/collections/queries";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button asChild>
          <Link href="/admin/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle collection
          </Link>
        </Button>
      </div>
      <CollectionsTable collections={collections} />
    </div>
  );
}
