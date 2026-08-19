
import ProductForm from "@/components/admin/products/ProductForm";
import { getCategories } from "@/lib/categories/queries";

export default async function NewProductPage() {
  const categories = await getCategories();

  console.log("[new product page] categories loaded:", {
    count: categories.length,
    sample: categories.slice(0, 3),
  });

  return (
    <div className="flex flex-col max-w-5xl">
      <ProductForm categories={categories} />
    </div>
  );
}