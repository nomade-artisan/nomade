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
    <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-border/80 bg-background/98 p-3 shadow-lg shadow-black/5 backdrop-blur supports-backdrop-filter:bg-background/90">
      <div className="flex items-center justify-between gap-4">
        <div className="hidden min-w-0 sm:block">
          <p className="text-sm font-medium text-foreground">Finaliser la fiche produit</p>
          <p className="text-xs text-muted-foreground">
            Verifie les informations avant validation.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
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
            className="min-w-42.5"
          >
            <Save className="mr-2 h-4 w-4" />

            {isEditing
              ? "Enregistrer"
              : "Créer le produit"}
          </Button>
        </div>
      </div>
    </div>
  );
}