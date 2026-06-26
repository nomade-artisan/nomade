"use client";

import { Dispatch, SetStateAction } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Catégorie
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <Label>
            Catégorie du produit
          </Label>

          <Select
            value={
              product.categoryId?.toString() ?? ""
            }
            onValueChange={(value) =>
              setProduct((prev) => ({
                ...prev,
                categoryId: Number(value),
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id.toString()}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}