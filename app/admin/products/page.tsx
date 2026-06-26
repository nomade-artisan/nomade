import { getProductsList, getCategoryNames } from "@/lib/products/queries";
import type { ProductListOptions } from "@/lib/products/queries";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import ProductsTable from "@/components/admin/products/ProductsTable";
import ProductsPagination from "@/components/admin/products/ProductsPagination";

interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
    category?: string;
    sortField?: string;
    sortDirection?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const options: ProductListOptions = {
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    search: params.search || "",
    status: (params.status as ProductListOptions["status"]) || "all",
    category: params.category || "all",
    sortField: (params.sortField as ProductListOptions["sortField"]) || "created_at",
    sortDirection: (params.sortDirection as ProductListOptions["sortDirection"]) || "desc",
  };

  // Deux requêtes en parallèle
  const [{ data, total, page, pageSize, totalPages }, categories] =
    await Promise.all([
      getProductsList(options),
      getCategoryNames(),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-sm text-muted-foreground">
            {total} produit{total > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      <ProductsTable
        products={data}
        categories={categories}
        currentSearch={String(options.search)}
        currentStatus={String(options.status)}
        currentCategory={String(options.category)}
        currentSortField={String(options.sortField)}
        currentSortDirection={String(options.sortDirection)}
      />

      {totalPages > 1 && (
        <ProductsPagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}