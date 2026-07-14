export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface CollectionFormState {
  name: string;
  slug: string;
  description: string;
}
export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_path: string;
  video_path: string;
  created_at: string;
}

export interface CollectionFormState {
  name: string;
  slug: string;
  description: string;
}
