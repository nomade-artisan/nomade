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
        <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
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
        </div>

        <div className="divide-y md:hidden">
          {categories.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Aucune catégorie</p>
          ) : (
            categories.map((cat) => (
              <article key={cat.id} className="space-y-4 p-4 sm:p-5">
                <div className="min-w-0">
                  <h2 className="break-words font-medium">{cat.name}</h2>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{cat.slug}</p>
                </div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Collection</dt>
                    <dd className="mt-1">{cat.collection?.name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Description</dt>
                    <dd className="mt-1 break-words">{cat.description || "—"}</dd>
                  </div>
                </dl>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm" className="min-h-11 w-full">
                    <Link href={`/admin/categories/${cat.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />Modifier
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="min-h-11 w-full"
                    onClick={() => setDeleteId(cat.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />Supprimer
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
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
