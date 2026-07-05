"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Search, ArrowUpDown, X } from "lucide-react";
import Link from "next/link";
import ProductStatusBadge from "./ProductStatusBadge";
import type { ProductListItem } from "@/lib/products/queries";

interface Props {
  products: ProductListItem[];
  categories: string[];
  currentSearch: string;
  currentStatus: string;
  currentCategory: string;
  currentSortField: string;
  currentSortDirection: string;
}

type SortField = "name" | "price" | "stock" | "created_at";

export default function ProductsTable({
  products,
  categories,
  currentSearch,
  currentStatus,
  currentCategory,
  currentSortField,
  currentSortDirection,
}: Props) {
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const status = formData.get("status") as string;
    const category = formData.get("category") as string;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (category && category !== "all") params.set("category", category);
    params.set("page", "1");

    router.push(`/admin/products?${params.toString()}`);
  }

  function handleSort(field: SortField) {
    const params = new URLSearchParams(window.location.search);
    params.set("sortField", field);

    if (currentSortField === field) {
      params.set("sortDirection", currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      params.set("sortDirection", "asc");
    }

    router.push(`/admin/products?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/admin/products");
  }

  const hasFilters = currentSearch || currentStatus !== "all" || currentCategory !== "all";

  return (
    <Card>
      <CardHeader>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Rechercher un produit..."
                defaultValue={currentSearch}
                className="pl-9"
              />
            </div>

            {/* Filtre statut */}
            <Select name="status" defaultValue={currentStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre catégorie */}
            <Select name="category" defaultValue={currentCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Filtrer
            </Button>

            {hasFilters && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </form>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-4 py-2 text-sm text-muted-foreground border-b">
          {products.length} résultat{products.length > 1 ? "s" : ""}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <SortableHeader
                label="Nom"
                field="name"
                currentField={currentSortField}
                direction={currentSortDirection}
                onSort={handleSort}
              />
              <th className="text-left p-4 text-sm font-medium">Catégorie</th>
              <SortableHeader
                label="Prix"
                field="price"
                currentField={currentSortField}
                direction={currentSortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Stock"
                field="stock"
                currentField={currentSortField}
                direction={currentSortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Date"
                field="created_at"
                currentField={currentSortField}
                direction={currentSortDirection}
                onSort={handleSort}
              />
              <th className="text-left p-4 text-sm font-medium">Statut</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  <p className="text-lg font-medium">Aucun produit trouvé</p>
                  <p className="text-sm mt-1">
                    Essayez de modifier vos filtres de recherche
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.cover_image && (
                        <img
                          src={product.cover_image}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{product.category_name || "—"}</td>
                  <td className="p-4 text-sm font-medium">
                    {product.price.toFixed(2)} €
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-sm font-medium ${
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock < 10
                          ? "text-orange-500"
                          : ""
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-4">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="p-4 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/${product.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Éditer
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// Composant pour les en-têtes triables
function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: {
  label: string;
  field: SortField;
  currentField: string;
  direction: string;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <th
      className="text-left p-4 cursor-pointer hover:bg-muted/50 select-none text-sm font-medium"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`h-4 w-4 ${
            isActive ? "text-primary" : "text-muted-foreground opacity-50"
          }`}
        />
        {isActive && (
          <span className="text-xs text-primary ml-1">
            {direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );
}