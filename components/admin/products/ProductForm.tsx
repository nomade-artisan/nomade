"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import ProductGeneral from "./sections/ProductGeneral";
import ProductCategory from "./sections/ProductCategory";
import ProductMedia from "./sections/ProductMedia";
import ProductDetails from "./sections/ProductDetails";
import ProductInventory from "./sections/ProductInventory";
import ProductActions from "./sections/ProductActions";
import ProductEditActions from "./sections/ProductEditActions";

import { ProductFormState } from "./types";
import type { ProductWithImages, Category } from "@/lib/products/types";

interface ProductFormProps {
  categories: Category[];
  initialProduct?: ProductWithImages | null;
  mode?: "create" | "edit";
  productId?: number;
}

export default function ProductForm({
  categories,
  initialProduct,
  mode = "create",
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductFormState>({
    name: "",
    slug: "",
    description: "",
    categoryId: null,
    price: 0,
    stock: 0,
    status: "draft",
    isNew: false,
    details: [],
    images: [],
  });

  useEffect(() => {
    if (initialProduct) {
      setProduct({
        name: initialProduct.name,
        slug: initialProduct.slug,
        description: initialProduct.description,
        categoryId: initialProduct.category_id,
        price: initialProduct.price,
        stock: initialProduct.stock,
        status: initialProduct.status as "draft" | "active" | "archived",
        isNew: initialProduct.is_new,
        details: initialProduct.details || [],
        images:
          initialProduct.images?.map((img) => ({
            id: String(img.id),
            file: new File([], img.image_url.split("/").pop() || "image.webp"),
            preview: img.image_url,
            isCover: img.position === 0,
            isExisting: true, // ✅ Marquer comme image existante
          })) || [],
      });
    }
  }, [initialProduct]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    if (product.categoryId) formData.append("categoryId", String(product.categoryId));
    formData.append("price", String(product.price));
    formData.append("stock", String(product.stock));
    formData.append("status", product.status);
    formData.append("isNew", String(product.isNew));
    formData.append("details", JSON.stringify(product.details));

    // Nouvelles images à uploader
    product.images
      .filter((img) => !img.isExisting)
      .forEach((img) => {
        formData.append("images", img.file);
      });

    // Index de la cover
    const coverIndex = product.images.findIndex((img) => img.isCover);
    formData.append("coverImageIndex", String(coverIndex >= 0 ? coverIndex : 0));

    // ✅ Envoyer les URLs existantes DANS L'ORDRE (cover en premier)
    const existingUrls = product.images
      .filter((img) => img.isExisting)
      .sort((a, b) => {
        if (a.isCover) return -1;
        if (b.isCover) return 1;
        return 0;
      })
      .map((img) => img.preview);
    formData.append("existingUrls", JSON.stringify(existingUrls));

    if (mode === "edit" && initialProduct) {
      formData.append("productId", String(initialProduct.id));
    }

    const response = await fetch("/api/admin/products", {
      method: mode === "create" ? "POST" : "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur sauvegarde");
    }

    router.push("/admin/products");
    router.refresh();
  } catch (err) {
    console.error(err);
    setError(err instanceof Error ? err.message : "Erreur");
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <ProductGeneral product={product} setProduct={setProduct} />

      <ProductCategory
        product={product}
        setProduct={setProduct}
        categories={categories}
      />

      <ProductMedia product={product} setProduct={setProduct} />

      <ProductDetails product={product} setProduct={setProduct} />

      <ProductInventory product={product} setProduct={setProduct} />

      {mode === "create" ? (
        <ProductActions isLoading={isSubmitting} />
      ) : (
        <ProductEditActions
          isSubmitting={isSubmitting}
          productId={productId || 0}
        />
      )}
    </form>
  );
}