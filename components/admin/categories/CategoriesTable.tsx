"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Category } from "@/lib/categories/types";

interface Props {
  categories: Category[];
}

export default function CategoriesTable({ categories }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/categories?id=${deleteId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-4 text-sm">Collection</th>
              <th className="text-left p-4 text-sm">Nom</th>
              <th className="text-left p-4 text-sm">Slug</th>
              <th className="text-left p-4 text-sm">Description</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-muted/50">
                <td className="p-4 text-sm text-muted-foreground">{cat.collection?.name || "—"}</td>
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{cat.slug}</td>
                <td className="p-4 text-sm">{cat.description || "—"}</td>
                <td className="p-4 text-right space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/categories/${cat.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />Éditer
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(cat.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}