// lib/categories/queries.ts

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCategories() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}