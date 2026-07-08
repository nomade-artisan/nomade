"use client";

import { Dispatch, SetStateAction, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Trash2, Plus } from "lucide-react";

import { ProductFormState } from "../types";

interface ProductDetailsProps {
  product: ProductFormState;
  setProduct: Dispatch<SetStateAction<ProductFormState>>;
}

export default function ProductDetails({
  product,
  setProduct,
}: ProductDetailsProps) {
  const [detail, setDetail] = useState("");

  function addDetail() {
    const value = detail.trim();

    if (!value) return;

    setProduct((prev) => ({
      ...prev,
      details: [...prev.details, value],
    }));

    setDetail("");
  }

  function removeDetail(index: number) {
    setProduct((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Caractéristiques
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="flex gap-3">

          <Input
            placeholder="Ex : Compartiment ordinateur 16 pouces"
            value={detail}
            onChange={(e) =>
              setDetail(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDetail();
              }
            }}
          />

          <Button
            type="button"
            onClick={addDetail}
          >
            <Plus className="mr-2 h-4 w-4" />

            Ajouter
          </Button>

        </div>

        {product.details.length > 0 && (

          <div className="space-y-2">

            {product.details.map((item, index) => (

              <div
                key={index}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-lg
                  border
                  p-3
                "
              >
                <span>
                  {item}
                </span>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    removeDetail(index)
                  }
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>

              </div>

            ))}

          </div>

        )}

      </CardContent>
    </Card>
  );
}