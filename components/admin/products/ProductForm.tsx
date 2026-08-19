"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Package, Tags } from "lucide-react";

import ProductGeneral from "./sections/ProductGeneral";
import ProductCategory from "./sections/ProductCategory";
import ProductMedia from "./sections/ProductMedia";
import ProductDetails from "./sections/ProductDetails";
import ProductInventory from "./sections/ProductInventory";
import ProductActions from "./sections/ProductActions";
import ProductEditActions from "./sections/ProductEditActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ProductFormState } from "./types";
import type { ProductWithImages, Category } from "@/lib/products/types";

interface ProductFormProps {
  categories: Category[];
  initialProduct?: ProductWithImages | null;
  mode?: "create" | "edit";
  productId?: number;
}

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasRequiredSpec(details: string[]): boolean {
  const requiredKeys = ["matiere", "dimensions"];

  return details.some((item) => {
    const [rawKey] = item.split(":");
    if (!rawKey) return false;

    const normalized = normalizeForComparison(rawKey);
    return requiredKeys.some((required) => normalized === required);
  });
}

function validateProductForm(product: ProductFormState): string[] {
  const errors: string[] = [];
  const details = sanitizeDetails(product.details);

  if (!product.name.trim()) {
    errors.push("Le nom du produit est obligatoire.");
  }

  if (!product.description.trim()) {
    errors.push("La description est obligatoire.");
  }

  if (!product.categoryId) {
    errors.push("La categorie est obligatoire.");
  }

  if (!Number.isFinite(product.price) || product.price <= 0) {
    errors.push("Le prix doit etre superieur a 0.");
  }

  if (!Number.isFinite(product.stock) || product.stock < 0) {
    errors.push("Le stock doit etre superieur ou egal a 0.");
  }

  if (product.images.length === 0) {
    errors.push("Au moins une image est obligatoire.");
  }

  if (details.length === 0) {
    errors.push("Ajoute au moins une caracteristique produit.");
  }

  if (!hasRequiredSpec(details)) {
    errors.push("Ajoute au minimum une matiere ou des dimensions dans les caracteristiques.");
  }

  return errors;
}

function sanitizeDetails(details: string[] | null | undefined): string[] {
  return (details || []).map((item) => item.trim()).filter(Boolean);
}

export default function ProductForm({
  categories,
  initialProduct,
  mode = "create",
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [product, setProduct] = useState<ProductFormState>({
    name: "",
    slug: "",
    description: "",
    collectionId: null,
    categoryId: null,
    price: 0,
    stock: 0,
    status: "draft",
    isNew: false,
    details: [],
    images: [],
  });

  const summary = useMemo(
    () => ({
      imageCount: product.images.length,
      detailCount: sanitizeDetails(product.details).length,
      statusLabel:
        product.status === "active"
          ? "Actif"
          : product.status === "archived"
            ? "Archive"
            : "Brouillon",
    }),
    [product.details, product.images.length, product.status]
  );

  useEffect(() => {
    console.log("[ProductForm] props received:", {
      mode,
      categoryCount: categories.length,
      hasInitialProduct: !!initialProduct,
      sampleCategories: categories.slice(0, 3),
    });

    if (initialProduct) {
      setProduct({
        name: initialProduct.name,
        slug: initialProduct.slug,
        description: initialProduct.description,
        collectionId: initialProduct.category?.collection_id ?? null,
        categoryId: initialProduct.category_id,
        price: initialProduct.price,
        stock: initialProduct.stock,
        status: initialProduct.status as "draft" | "active" | "archived",
        isNew: initialProduct.is_new,
        details: sanitizeDetails(initialProduct.details),
        images:
          initialProduct.images?.map((img) => ({
            id: String(img.id),
            file: new File([], img.image_url.split("/").pop() || "image.webp"),
            preview: img.image_url,
            isCover: img.position === 0,
            isExisting: true,
          })) || [],
      });
    }
  }, [categories, initialProduct, mode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateProductForm(product);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("name", product.name.trim());
      formData.append("description", product.description);
      if (product.categoryId) {
        formData.append("categoryId", String(product.categoryId));
      }
      formData.append("price", String(product.price));
      formData.append("stock", String(product.stock));
      formData.append("status", product.status);
      formData.append("isNew", String(product.isNew));
      formData.append("details", JSON.stringify(sanitizeDetails(product.details)));

      product.images
        .filter((img) => !img.isExisting)
        .forEach((img) => {
          formData.append("images", img.file);
        });

      const coverIndex = product.images.findIndex((img) => img.isCover);
      formData.append("coverImageIndex", String(coverIndex >= 0 ? coverIndex : 0));

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
      setErrors([err instanceof Error ? err.message : "Erreur"]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <ul className="space-y-1 text-sm">
            {errors.map((error) => (
              <li key={error}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <Card className="border-border/70 bg-muted/20 shadow-sm">
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {mode === "create" ? "Nouvelle fiche produit" : "Edition de la fiche produit"}
            </p>
            <p className="text-sm text-muted-foreground">
              Garde une fiche lisible: informations claires, visuels propres et inventaire a jour.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-lg border bg-background px-3 py-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ImagePlus className="h-4 w-4" />
                Images
              </div>
              <p className="mt-1">{summary.imageCount}</p>
            </div>
            <div className="rounded-lg border bg-background px-3 py-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Tags className="h-4 w-4" />
                Details
              </div>
              <p className="mt-1">{summary.detailCount}</p>
            </div>
            <div className="rounded-lg border bg-background px-3 py-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Package className="h-4 w-4" />
                Statut
              </div>
              <p className="mt-1">{summary.statusLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <ProductGeneral product={product} setProduct={setProduct} />
          <ProductMedia product={product} setProduct={setProduct} />
          <ProductDetails product={product} setProduct={setProduct} />
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <ProductCategory
            product={product}
            setProduct={setProduct}
            categories={categories}
          />
          <ProductInventory product={product} setProduct={setProduct} />
        </div>
      </div>

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