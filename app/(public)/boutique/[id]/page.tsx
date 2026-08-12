import { getProductById, getProductsList, getProductRating } from "@/lib/products/queries";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import type { Metadata } from "next";
export const revalidate = 20
interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return {
      title: "Produit introuvable",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const product = await getProductById(productId);

  if (!product || product.status !== "active") {
    return {
      title: "Produit introuvable",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${product.name} | Boutique`;
  const description = product.description?.trim().length
    ? product.description.slice(0, 160)
    : `Découvrez ${product.name}, une pièce de maroquinerie SCOLTA by Nomade.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/boutique/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | SCOLTA by Nomade`,
      description,
      url: `/boutique/${product.id}`,
      type: "website",
      images: product.images?.length
        ? [
            {
              url: product.images[0].image_url,
              alt: product.name,
            },
          ]
        : undefined,
    },
  };
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
    category: product.category?.slug || "all",
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
    rating: ratingData.rating, 
    reviews: ratingData.reviews,
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