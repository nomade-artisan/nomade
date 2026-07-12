// lib/collections/mutations.ts
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ Admin client
import type { Collection, CollectionFormState } from "./types";

export async function createCollection(data: CollectionFormState): Promise<Collection> {
  const { data: collection, error } = await supabaseAdmin
    .from("collections")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Erreur création collection: ${error.message}`);
  return collection as Collection;
}

export async function updateCollection(id: number, data: CollectionFormState): Promise<Collection> {
  const { data: collection, error } = await supabaseAdmin
    .from("collections")
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Erreur mise à jour collection: ${error.message}`);
  return collection as Collection;
}

export async function deleteCollection(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("collections")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Erreur suppression collection: ${error.message}`);
}