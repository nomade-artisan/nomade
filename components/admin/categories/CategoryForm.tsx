"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category, CategoryFormState } from "@/lib/categories/types";
import type { Collection } from "@/lib/collections/types";

interface Props {
  initialData?: Category;
  collections: Collection[];
}

function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export default function CategoryForm({ initialData, collections }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    collectionId: initialData?.collection_id || collections[0]?.id || null,
  });

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : generateCategorySlug(name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const url = initialData
      ? "/api/admin/categories"
      : "/api/admin/categories";
    const method = initialData ? "PUT" : "POST";
    const body = initialData ? { id: initialData.id, ...form } : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Modifier la catégorie" : "Nouvelle catégorie"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
          )}
          <div>
            <Label className="text-sm font-medium">Collection</Label>
            <select
              value={form.collectionId?.toString() || ""}
              onChange={(e) => setForm({ ...form, collectionId: Number(e.target.value) || null })}
              className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Choisir une collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id.toString()}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Nom</label>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}