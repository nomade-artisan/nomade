"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function CustomersPagination({ page, totalPages }: Props) {
  const router = useRouter();

  function goToPage(newPage: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    router.push(`/admin/customers?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <span className="text-sm text-muted-foreground">
        Page {page} sur {totalPages}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}