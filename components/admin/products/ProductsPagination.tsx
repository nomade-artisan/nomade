"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductsPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function ProductsPagination({
  page,
  pageSize,
  total,
  totalPages,
}: ProductsPaginationProps) {
  const router = useRouter();

  function goToPage(newPage: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    router.push(`/admin/products?${params.toString()}`);
  }

  function handlePageSizeChange(value: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("pageSize", value);
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-b-lg border-t bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="text-sm text-muted-foreground">
          {total} produit{total > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Par page</span>
          <select
            value={String(pageSize)}
            onChange={(event) => handlePageSizeChange(event.target.value)}
            className="flex h-11 w-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-9"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <span className="text-sm text-muted-foreground">Page {page} sur {totalPages}</span>
      </div>

      <div className="flex max-w-full flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label="Page précédente"
          className="min-h-11 min-w-11"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {generatePageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="hidden px-2 text-muted-foreground sm:inline">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              aria-label={`Aller à la page ${p}`}
              onClick={() => goToPage(p as number)}
              className="hidden min-w-[40px] sm:inline-flex"
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          aria-label="Page suivante"
          className="min-h-11 min-w-11"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Génère les numéros de page avec ellipsis
function generatePageNumbers(
  current: number,
  total: number
): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (current > 3) pages.push("...");

  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
