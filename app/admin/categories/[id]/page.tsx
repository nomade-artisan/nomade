import React from "react";
import { getCategoryById } from "@/lib/shipping/categories/queries";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/categories/CategoryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const categoryId = Number(id);

  if (isNaN(categoryId)) {
    notFound();
  }

  const category = await getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modifier la catégorie</h1>
      <CategoryForm initialData={category} />
    </div>
  );
}