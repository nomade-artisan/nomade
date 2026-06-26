"use client";

import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  isSubmitting?: boolean;
  id?: number;
}

export default function ProductActions({ isSubmitting = false }: ProductActionsProps) {
  return (
    <div className="flex justify-end gap-4 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={() => window.history.back()}
        disabled={isSubmitting}
      >
        editer
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Product"}
      </Button>
    </div>
  );
}