"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateCategorySlug } from "@/lib/shipping/categories/queries";
import type { Category, CategoryFormState } from "@/lib/shipping/categories/types";

interface Props {
  initialData?: Category;
}

export default function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
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