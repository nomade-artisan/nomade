"use client";

import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ProductFormState } from "../types";

interface Category {
  id: number;
  name: string;
  collection_id: number;
  collection?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface ProductCategoryProps {
  product: ProductFormState;
  setProduct: Dispatch<SetStateAction<ProductFormState>>;
  categories: Category[];
}

export default function ProductCategory({
  product,
  setProduct,
  categories,
}: ProductCategoryProps) {
  useEffect(() => {
    console.log("[ProductCategory] categories prop:", {
      count: categories.length,
      sample: categories.slice(0, 3),
      product: {
        collectionId: product.collectionId,
        categoryId: product.categoryId,
      },
    });
  }, [categories, product.categoryId, product.collectionId]);

  const collections = useMemo(() => {
    const collectionMap = new Map<number, { id: number; name: string }>();

    categories.forEach((category) => {
      // Si la relation collection est chargée
      if (category.collection) {
        collectionMap.set(category.collection.id, {
          id: category.collection.id,
          name: category.collection.name,
        });
      }
      // Fallback : utiliser collection_id et un nom générique si la relation est absente
      else if (category.collection_id) {
        collectionMap.set(category.collection_id, {
          id: category.collection_id,
          name: `Collection ${category.collection_id}`,
        });
      }
    });

    const builtCollections = Array.from(collectionMap.values());

    console.log("[ProductCategory] built collections:", {
      count: builtCollections.length,
      values: builtCollections,
    });

    return builtCollections;
  }, [categories]);

  // Filtrer les catégories selon la collection sélectionnée
  const filteredCategories = useMemo(() => {
    if (!product.collectionId) return [];
    return categories.filter(
      (category) => category.collection_id === product.collectionId
    );
  }, [categories, product.collectionId]);

  // Si la collection sélectionnée n'existe plus dans la liste, la réinitialiser
  useEffect(() => {
    if (
      product.collectionId &&
      !collections.some((c) => c.id === product.collectionId)
    ) {
      setProduct((prev) => ({
        ...prev,
        collectionId: null,
        categoryId: null,
      }));
    }
  }, [collections, product.collectionId, setProduct]);

  // Si la catégorie sélectionnée n'appartient plus à la collection, la réinitialiser
  useEffect(() => {
    if (
      product.categoryId &&
      !filteredCategories.some((c) => c.id === product.categoryId)
    ) {
      setProduct((prev) => ({ ...prev, categoryId: null }));
    }
  }, [filteredCategories, product.categoryId, setProduct]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catégorie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection de la collection */}
        <div className="space-y-2">
          <Label>Collection</Label>
          <select
            value={product.collectionId?.toString() ?? ""}
            onChange={(event) =>
              setProduct((prev) => ({
                ...prev,
                collectionId: Number(event.target.value) || null,
                categoryId: null,
              }))
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="">Choisir une collection</option>
            {collections.length === 0 ? (
              <option value="" disabled>
                Aucune collection disponible
              </option>
            ) : (
              collections.map((collection) => (
                <option key={collection.id} value={collection.id.toString()}>
                  {collection.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Sélection de la catégorie */}
        <div className="space-y-2">
          <Label>Catégorie du produit</Label>
          <select
            value={product.categoryId?.toString() ?? ""}
            onChange={(event) => {
              const selectedCategory = categories.find(
                (category) => category.id === Number(event.target.value)
              );
              setProduct((prev) => ({
                ...prev,
                collectionId: selectedCategory?.collection_id ?? prev.collectionId,
                categoryId: Number(event.target.value) || null,
              }));
            }}
            disabled={!product.collectionId}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {product.collectionId
                ? "Choisir une catégorie"
                : "Choisissez d'abord une collection"}
            </option>
            {filteredCategories.length === 0 ? (
              <option value="" disabled>
                {product.collectionId
                  ? "Aucune catégorie dans cette collection"
                  : "Sélectionnez d'abord une collection"}
              </option>
            ) : (
              filteredCategories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}