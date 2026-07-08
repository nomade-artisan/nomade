"use client";

import { Dispatch, SetStateAction, useMemo } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ProductFormState } from "../types";

interface ProductGeneralProps {
  product: ProductFormState;
  setProduct: Dispatch<SetStateAction<ProductFormState>>;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

export default function ProductGeneral({
  product,
  setProduct,
}: ProductGeneralProps) {
  const slug = useMemo(
    () => slugify(product.name),
    [product.name]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Informations générales
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Nom du produit
          </Label>

          <Input
            id="name"
            value={product.name}
            onChange={(e) =>
              setProduct((prev) => ({
                ...prev,
                name: e.target.value,
                slug: slugify(e.target.value),
              }))
            }
            placeholder="Sac Explorer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug
          </Label>

          <Input
            id="slug"
            value={slug}
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description
          </Label>

          <Textarea
            id="description"
            rows={8}
            value={product.description}
            onChange={(e) =>
              setProduct((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}