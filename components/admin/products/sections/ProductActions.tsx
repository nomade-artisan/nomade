"use client";

import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import Link from "next/link";

interface ProductActionsProps {
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function ProductActions({
  isLoading = false,
  isEditing = false,
}: ProductActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl border bg-background p-4">
      <Button
        asChild
        type="button"
        variant="outline"
      >
        <Link href="/admin/products">
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Link>
      </Button>

      <Button
        type="submit"
        disabled={isLoading}
      >
        <Save className="mr-2 h-4 w-4" />

        {isEditing
          ? "Enregistrer les modifications"
          : "Créer le produit"}
      </Button>
    </div>
  );
}