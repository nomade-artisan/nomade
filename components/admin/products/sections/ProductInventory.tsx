"use client";

import { Dispatch, SetStateAction } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";

import { ProductFormState } from "../types";

interface ProductInventoryProps {
  product: ProductFormState;
  setProduct: Dispatch<SetStateAction<ProductFormState>>;
}

export default function ProductInventory({
  product,
  setProduct,
}: ProductInventoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Inventaire
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="grid md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <Label>
              Prix (€)
            </Label>

            <Input
              type="number"
              min={0}
              step="0.01"
              value={product.price}
              onChange={(e) =>
                setProduct((prev) => ({
                  ...prev,
                  price: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Stock
            </Label>

            <Input
              type="number"
              min={0}
              value={product.stock}
              onChange={(e) =>
                setProduct((prev) => ({
                  ...prev,
                  stock: Number(e.target.value),
                }))
              }
            />
          </div>

        </div>

        <div className="space-y-2">
          <Label>
            Statut
          </Label>

          <select
            value={product.status}
            onChange={(event) =>
              setProduct((prev) => ({
                ...prev,
                status: event.target.value as ProductFormState["status"],
              }))
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="draft">Brouillon</option>
            <option value="active">Actif</option>
            <option value="archived">Archivé</option>
          </select>
        </div>

        <div className="flex items-center gap-3">

          <Checkbox
            checked={product.isNew}
            onCheckedChange={(checked) =>
              setProduct((prev) => ({
                ...prev,
                isNew: checked === true,
              }))
            }
          />

          <Label>
            Nouveau produit
          </Label>

        </div>

      </CardContent>
    </Card>
  );
}