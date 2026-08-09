import {
  createProduct,
  updateProduct,
  deleteProduct,
  createProductImages,
  deleteProductImagesByProductId,
} from "./mutations";
import { uploadProductImages, deleteProductImages, getPublicUrl } from "./storage";
import type { ProductFormState, ProductWithImages } from "./types";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createCompleteProduct(
  productData: ProductFormState
): Promise<ProductWithImages> {
  // 1. Créer le produit dans la DB
  const product = await createProduct({
    name: productData.name,
    slug: productData.slug,
    description: productData.description,
    categoryId: productData.categoryId,
    price: productData.price,
    stock: productData.stock,
    status: productData.status,
    isNew: productData.isNew,
    details: productData.details,
  });

  // 2. Uploader les images vers Supabase Storage
  if (productData.images.length > 0) {
    const files = productData.images.map((img) => img.file);
    const uploadedPaths = await uploadProductImages(files);

    // 3. Récupérer les URLs publiques
    const imageUrls = uploadedPaths.map((upload) => getPublicUrl(upload.path));

    // 4. Créer les entrées dans product_images
    const imageRecords = imageUrls.map((url, index) => ({
      productId: product.id,
      imageUrl: url,
      position: productData.images[index].isCover ? 0 : index + 1,
    }));

    await createProductImages(imageRecords);
  }

  // 5. Retourner le produit avec ses relations
  return {
    ...product,
    images: [],
    category: null,
  };
}

export async function updateCompleteProduct(
  productId: number,
  productData: ProductFormState,
  existingUrls: string[] = [],
): Promise<ProductWithImages> {
  // 1. Mettre à jour le produit
  const product = await updateProduct({
    id: productId,
    name: productData.name,
    slug: productData.slug,
    description: productData.description,
    categoryId: productData.categoryId,
    price: productData.price,
    stock: productData.stock,
    status: productData.status,
    isNew: productData.isNew,
    details: productData.details,
  });

  // 2. Récupérer les images actuelles en DB
  const { data: oldImages } = await supabaseAdmin
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("position");

  // 3. Identifier les images à supprimer
  const existingUrlsSet = new Set(existingUrls);

  if (oldImages) {
    const toDelete = oldImages.filter(
      (img: any) => !existingUrlsSet.has(img.image_url)
    );

    if (toDelete.length > 0) {
      const pathsToDelete = toDelete
        .map((img: any) => {
          const match = img.image_url.match(/product-images\/(.+)/);
          return match ? `product-images/${match[1]}` : null;
        })
        .filter(Boolean) as string[];

      if (pathsToDelete.length > 0) {
        await deleteProductImages(pathsToDelete);
      }

      for (const img of toDelete) {
        await supabaseAdmin.from("product_images").delete().eq("id", img.id);
      }
    }

    for (let i = 0; i < existingUrls.length; i++) {
      await supabaseAdmin
        .from("product_images")
        .update({ position: i === 0 ? 0 : i })
        .eq("product_id", productId)
        .eq("image_url", existingUrls[i]);
    }
  }

  // 4. Uploader les nouvelles images
  if (productData.images.length > 0) {
    const files = productData.images.map((img) => img.file);
    const uploadedPaths = await uploadProductImages(files);
    const imageUrls = uploadedPaths.map((upload) => getPublicUrl(upload.path));

    const startPosition = existingUrls.length;

    const imageRecords = imageUrls.map((url, index) => ({
      productId: product.id,
      imageUrl: url,
      position: productData.images[index].isCover ? 0 : startPosition + index,
    }));

    await createProductImages(imageRecords);
  }

  return {
    ...product,
    images: [],
    category: null,
  };
}

export async function deleteCompleteProduct(productId: number): Promise<void> {
  // 1. Récupérer les URLs des images pour les supprimer du storage
  const { supabaseAdmin } = await import("@/lib/supabase/admin");
  
  const { data: images } = await supabaseAdmin
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId);

  // 2. Supprimer les fichiers du storage
  if (images && images.length > 0) {
    const pathsToDelete = images
      .map((img: any) => {
        const match = img.image_url.match(/product-images\/(.+)/);
        return match ? `product-images/${match[1]}` : null;
      })
      .filter(Boolean) as string[];

    if (pathsToDelete.length > 0) {
      await deleteProductImages(pathsToDelete);
    }
  }

  // 3. Supprimer les entrées dans product_images
  await deleteProductImagesByProductId(productId);

  // 4. Supprimer le produit
  await deleteProduct(productId);
}