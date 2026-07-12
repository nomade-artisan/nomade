import CollectionForm from "@/components/admin/collections/CollectionForm";

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle collection</h1>
      <CollectionForm />
    </div>
  );
}
