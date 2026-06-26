// app/admin/products/new/page.tsx

import ProductForm from "@/components/admin/products/ProductForm";
import { getCategories } from "@/lib/categories/queries";

export default async function NewProductPage() {
  const categories =
    await getCategories();

  return (
    <div className="flex h-full flex-col max-w-5xl">
      <ProductForm
        categories={categories}
      />
    </div>
  );
}