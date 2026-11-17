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
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden min-w-0 sm:block">
          <p className="text-sm font-medium text-foreground">Finaliser la fiche produit</p>
          <p className="text-xs text-muted-foreground">
            Verifie les informations avant validation.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <Button
            asChild
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
          >
            <Link href="/admin/products">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="min-h-11 w-full sm:min-w-42.5 sm:w-auto"
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
