// lib/products/queries.ts
import { supabase } from "@/lib/supabase/client";
import type { ProductWithImages, Category, Review, CreateReviewInput, ProductRating } from "./types";

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
  is_new: boolean;
  category_slug: string | null;
  category_name: string | null;
  collection_slug: string | null;
  collection_name: string | null;
  cover_image: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "all" | "draft" | "active" | "archived";
  collection?: string;
  category?: string;
  sortField?: "name" | "price" | "stock" | "created_at";
  sortDirection?: "asc" | "desc";
}

export async function getProductsList(
  options: ProductListOptions = {}
): Promise<PaginatedResponse<ProductListItem>> {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    status = "all",
    collection = "all",
    category = "all",
    sortField = "created_at",
    sortDirection = "desc",
  } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      price,
      stock,
      status,
      is_new,
      created_at,
      category:categories(
        name,
        slug,
        collection:collections(name, slug)
      ),
      images:product_images(image_url, position)
    `,
      { count: "exact" }
    );

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (collection !== "all") {
    query = query.filter("category.collection.slug", "eq", collection);
  }

  if (category !== "all") {
    query = query.filter("category.slug", "eq", category);
  }

  query = query.order(sortField, { ascending: sortDirection === "asc" });
  query = query.order("position", { referencedTable: "product_images" });
  query = query.limit(1, { referencedTable: "product_images" });
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products list:", error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const products: ProductListItem[] = (data || []).map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    stock: product.stock,
    status: product.status,
    is_new: product.is_new,
    created_at: product.created_at,
    category_slug: product.category?.slug || null,
    category_name: product.category?.name || null,
    collection_slug: product.category?.collection?.slug || null,
    collection_name: product.category?.collection?.name || null,
    cover_image: product.images?.[0]?.image_url || null,
  }));

  return {
    data: products,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getProductById(id: number): Promise<ProductWithImages | null> {
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product by id:", { id, error });
    return null;
  }

  return product as unknown as ProductWithImages;
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:categories(*)
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product by slug:", { slug, error });
    return null;
  }

  return product as unknown as ProductWithImages | null;
}

export async function getProductForEdit(id: number): Promise<ProductWithImages | null> {
  // Vérifier si le produit existe
  const { data: exists, error: existError } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .single();

  if (existError || !exists) {
    console.error("Product not found:", { id, error: existError });
    return null;
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      price,
      stock,
      status,
      is_new,
      details,
      category_id,
      category:categories(*, collection:collections(*)),
      images:product_images(*)
    `)   // ✅ plus de virgule en trop
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product for edit:", { id, error });
    return null;
  }

  return product as unknown as ProductWithImages;
}

export async function getAllProducts(): Promise<ProductWithImages[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(*),
      category:categories(*, collection:collections(*))
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as unknown as ProductWithImages[];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(`
      *,
      collection:collections(*)
    `)
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data as Category[];
}

export async function getCategoryNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  if (error) {
    console.error("Error fetching category names:", error);
    return [];
  }

  return (data || []).map((c: any) => c.name);
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);

  const suffix = Date.now().toString(36);

  return `${base}-${suffix}`;
}

// ===================== REVIEWS =====================

export async function getProductReviews(productId: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return data as Review[];
}

export async function getProductRating(productId: number): Promise<ProductRating> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error || !data.length) {
    return { rating: 0, reviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }

  const total = data.length;
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  data.forEach((r) => {
    distribution[r.rating as keyof typeof distribution]++;
  });

  return {
    rating: Math.round((sum / total) * 10) / 10,
    reviews: total,
    distribution,
  };
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: input.product_id,
      user_name: input.user_name,
      rating: input.rating,
      comment: input.comment,
    })
    .select()
    .single();

  if (error) throw new Error(`Erreur création avis : ${error.message}`);
  if (!data) throw new Error("Aucune donnée retournée");

  return data as Review;
}