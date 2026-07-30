export interface ProductImageFile {
  id: string
  file: File
  preview: string
  isCover: boolean
  isExisting?: boolean
}

export interface ProductFormState {
  name: string
  slug: string
  description: string
  collectionId: number | null
  categoryId: number | null
  price: number
  stock: number
  status: "draft" | "active" | "archived"
  isNew: boolean
  details: string[]
  images: ProductImageFile[]
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  category_id: number | null
  price: number
  stock: number
  is_new: boolean
  related_products: number[]
  created_at: string
  updated_at: string
  status: "draft" | "active" | "archived"
  details: string[]
}

export interface ProductWithImages extends Product {
  images: ProductImage[]
  category: Category | null
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  position: number
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  collection_id: number
  collection?: {
    id: number
    name: string
    slug: string
    description: string | null
    created_at: string
  } | null
  created_at: string
}

export interface CreateProductInput {
  name: string
  slug: string
  description: string
  categoryId: number | null
  price: number
  stock: number
  status: "draft" | "active" | "archived"
  isNew: boolean
  details: string[]
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number
}

// Ajoute à la fin du fichier
export interface Review {
  id: number;
  product_id: number;
  user_name: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
}

export interface CreateReviewInput {
  product_id: number;
  user_name: string;
  rating: number;
  comment: string;
}

export interface ProductRating {
  rating: number;
  reviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}