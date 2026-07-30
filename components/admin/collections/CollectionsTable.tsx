"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Collection } from "@/lib/collections/types";

interface Props {
  collections: Collection[];
}

export default function CollectionsTable({ collections }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/collections?id=${deleteId}`, { method: "DELETE" });
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
              <th className="p-4 text-left text-sm">Nom</th>
              <th className="p-4 text-left text-sm">Slug</th>
              <th className="p-4 text-left text-sm">Description</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{collection.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{collection.slug}</td>
                <td className="p-4 text-sm">{collection.description || "—"}</td>
                <td className="space-x-2 p-4 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/collections/${collection.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />Éditer
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(collection.id)}>
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
            <AlertDialogTitle>Supprimer la collection ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
