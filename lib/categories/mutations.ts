import { supabase } from "@/lib/db";
import type { CategoryFormState, Category } from "./types";

export async function createCategory(data: CategoryFormState): Promise<Category> {
  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Erreur création catégorie: ${error.message}`);
  return category as Category;
}

export async function updateCategory(id: number, data: CategoryFormState): Promise<Category> {
  const { data: category, error } = await supabase
    .from("categories")
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Erreur mise à jour: ${error.message}`);
  return category as Category;
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Erreur suppression: ${error.message}`);
}