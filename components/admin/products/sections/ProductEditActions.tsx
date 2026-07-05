"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductEditActionsProps {
  isSubmitting?: boolean;
  productId: number;
}

export default function ProductEditActions({
  isSubmitting = false,
  productId,
}: ProductEditActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); // ✅ Empêche la fermeture automatique du popup
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur suppression");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression");
      setIsDeleting(false); // ✅ Réactive seulement si erreur
    }
  }

  return (
    <div className="flex justify-between gap-4 pt-6 border-t">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est <span className="font-semibold text-destructive">irréversible</span>.
              Le produit et toutes ses images seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            {/* ✅ Bouton custom au lieu de AlertDialogAction */}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}