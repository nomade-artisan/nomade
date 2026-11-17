"use client";

import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  isSubmitting?: boolean;
  id?: number;
}

export default function ProductActions({ isSubmitting = false }: ProductActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end sm:gap-4">
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => window.history.back()}
        disabled={isSubmitting}
      >
        editer
      </Button>
      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Product"}
      </Button>
    </div>
  );
}
