import { notFound } from "next/navigation";
import CollectionForm from "@/components/admin/collections/CollectionForm";
import { getCollectionById } from "@/lib/collections/queries";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params;
  const collectionId = Number(id);

  if (Number.isNaN(collectionId)) {
    notFound();
  }

  const collection = await getCollectionById(collectionId);
  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modifier la collection</h1>
      <CollectionForm initialData={collection} />
    </div>
  );
}
