"use client";

import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  // 🔍 Debug : afficher les catégories reçues
  useEffect(() => {
    console.log("📦 Catégories reçues :", categories);
  }, [categories]);

  // Extraire les collections uniques (avec fallback si la relation n'est pas chargée)
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

    return Array.from(collectionMap.values());
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
          <Select
            value={product.collectionId?.toString() ?? ""}
            onValueChange={(value) =>
              setProduct((prev) => ({
                ...prev,
                collectionId: Number(value),
                categoryId: null,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir une collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.length === 0 ? (
                <SelectItem value="" disabled>
                  Aucune collection disponible
                </SelectItem>
              ) : (
                collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id.toString()}>
                    {collection.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection de la catégorie */}
        <div className="space-y-2">
          <Label>Catégorie du produit</Label>
          <Select
            value={product.categoryId?.toString() ?? ""}
            onValueChange={(value) => {
              const selectedCategory = categories.find(
                (category) => category.id === Number(value)
              );
              setProduct((prev) => ({
                ...prev,
                collectionId: selectedCategory?.collection_id ?? prev.collectionId,
                categoryId: Number(value),
              }));
            }}
            disabled={!product.collectionId}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  product.collectionId
                    ? "Choisir une catégorie"
                    : "Choisissez d'abord une collection"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.length === 0 ? (
                <SelectItem value="" disabled>
                  {product.collectionId
                    ? "Aucune catégorie dans cette collection"
                    : "Sélectionnez d'abord une collection"}
                </SelectItem>
              ) : (
                filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}