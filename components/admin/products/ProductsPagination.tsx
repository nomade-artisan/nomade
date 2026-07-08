"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="flex items-center justify-between border-t bg-muted/20 rounded-b-lg px-6 py-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {total} produit{total > 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Par page</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {generatePageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(p as number)}
              className="min-w-[40px]"
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
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