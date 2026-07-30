import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Collection } from "./types";

export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabaseAdmin
    .from("collections")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching collections:", error);
    return [];
  }

  return data as Collection[];
}

export async function getCollectionById(id: number): Promise<Collection | null> {
  const { data, error } = await supabaseAdmin
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching collection:", error);
    return null;
  }

  return data as Collection;
}

export function generateCollectionSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}
