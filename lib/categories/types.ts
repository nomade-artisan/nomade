import type { Collection } from "@/lib/collections/types";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  collection_id: number;
  collection?: Collection | null;
  created_at: string;
}

export interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  collectionId: number | null;
}