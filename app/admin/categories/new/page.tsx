import CategoryForm from "@/components/admin/categories/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle catégorie</h1>
      <CategoryForm />
    </div>
  );
}