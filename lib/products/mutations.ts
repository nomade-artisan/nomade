import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CreateProductInput, UpdateProductInput, Product, ProductImage } from "./types";

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      category_id: input.categoryId,
      price: input.price,
      stock: input.stock,
      status: input.status,
      is_new: input.isNew,
      details: input.details,
    })
    .select()
    .single();

  if (error) throw new Error(`Create product failed: ${error.message}`);
  if (!data) throw new Error("No data returned from create product");

  return data as Product;
}

export async function updateProduct(
  input: UpdateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.categoryId !== undefined && { category_id: input.categoryId }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.isNew !== undefined && { is_new: input.isNew }),
      ...(input.details !== undefined && { details: input.details }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(`Update product failed: ${error.message}`);
  if (!data) throw new Error("No data returned from update product");

  return data as Product;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Delete product failed: ${error.message}`);
}

export async function createProductImages(
  images: { productId: number; imageUrl: string; position: number }[]
): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .insert(
      images.map((img) => ({
        product_id: img.productId,
        image_url: img.imageUrl,
        position: img.position,
      }))
    )
    .select();

  if (error) throw new Error(`Create product images failed: ${error.message}`);
  if (!data) throw new Error("No data returned from create product images");

  return data as ProductImage[];
}

export async function deleteProductImagesByProductId(
  productId: number
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (error) throw new Error(`Delete product images failed: ${error.message}`);
}