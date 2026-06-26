import { getProductById, getProductsList, getProductRating } from "@/lib/products/queries";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
export const revalidate = 20
interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) notFound();

  const [product, ratingData] = await Promise.all([
    getProductById(productId),
    getProductRating(productId),
  ]);

  if (!product) notFound();

  // Produits de la même catégorie
  const { data: relatedData } = await getProductsList({
    pageSize: 4,
    status: "active",
    category: product.category?.name || "",
  });

  const formattedProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    images: product.images?.map((img: any) => img.image_url) || [],
    description: product.description,
    details: product.details || [],
    category: product.category?.name || "",
    stock: product.stock,
    rating: ratingData.rating, // ✅ Vraie note
    reviews: ratingData.reviews, // ✅ Vrai nombre d'avis
    isNew: product.is_new,
  };

  const relatedProducts = relatedData
    .filter((p) => p.id !== product.id)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      images: p.cover_image ? [p.cover_image] : [],
      description: "",
      details: [],
      category: p.category_name || "",
      stock: p.stock,
      rating: 5,
      reviews: 0,
      isNew: p.is_new,
    }));

  return (
    <ProductClient
      product={formattedProduct}
      relatedProducts={relatedProducts}
    />
  );
}