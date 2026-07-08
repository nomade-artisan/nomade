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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

          <Select
            value={product.status}
            onValueChange={(value) =>
              setProduct((prev) => ({
                ...prev,
                status:
                  value as ProductFormState["status"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="draft">
                Brouillon
              </SelectItem>

              <SelectItem value="active">
                Actif
              </SelectItem>

              <SelectItem value="archived">
                Archivé
              </SelectItem>

            </SelectContent>

          </Select>
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