import { isEasingArray } from "framer-motion"

// Types pour le formulaire
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
  categoryId: number | null
  price: number
  stock: number
  status: "draft" | "active" | "archived"
  isNew: boolean
  details: string[]
  images: ProductImageFile[]
}

// Types pour la base de données
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
  created_at: string
}

export interface ProductWithImages extends Product {
  images: ProductImage[]
  category: Category | null
}

// Types pour les mutations
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

// Type léger pour les listes
export interface ProductListItem {
  id: number
  name: string
  slug: string
  price: number
  stock: number
  status: string
  is_new: boolean
  category_name: string | null
  cover_image: string | null
  created_at: string
}

// Type pour la pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Options de recherche et tri
export interface ProductListOptions {
  page?: number
  limit?: number
  search?: string
  sortBy?: "name" | "price" | "stock" | "created_at"
  sortOrder?: "asc" | "desc"
  status?: string
  categoryId?: number
}