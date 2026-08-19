import React from "react";
import { getCategoryById } from "@/lib/categories/queries";
import { getCollections } from "@/lib/collections/queries";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/categories/CategoryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const categoryId = Number(id);

  if (isNaN(categoryId)) {
    notFound();
  }

  const [category, collections] = await Promise.all([
    getCategoryById(categoryId),
    getCollections(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modifier la catégorie</h1>
      <CategoryForm initialData={category} collections={collections} />
    </div>
  );
}