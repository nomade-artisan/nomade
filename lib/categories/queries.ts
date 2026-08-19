import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select(`
      *,
      collection:collections(*)
    `)
    .order("name");

  console.log("[getCategories] query result:", {
    count: data?.length ?? 0,
    error: error ? { message: error.message, details: error.details, hint: error.hint } : null,
    sample: data?.slice(0, 3) ?? [],
  });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data as Category[];
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select(`
      *,
      collection:collections(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }
  return data as Category;
}

export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}