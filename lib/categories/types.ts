export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
}