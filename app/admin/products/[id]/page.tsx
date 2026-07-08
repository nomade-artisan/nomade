import { getProductForEdit, getCategories } from "@/lib/products/queries";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/products/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    getProductForEdit(productId),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <h1 className="text-2xl font-bold">Modifier : {product.name}</h1>

      <ProductForm
        categories={categories}
        initialProduct={product}
        mode="edit"
        productId={productId}
      />
    </div>
  );
}