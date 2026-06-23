// app/boutique/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

async function getProduct(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const products = await res.json();
  return products.find((p: any) => p.id === Number(id)) || null;
}

async function getAllProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

// Fonction pour convertir snake_case → camelCase
function formatProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
    images: p.images || [],
    description: p.description || "",
    details: p.details || [],
    category: p.category || "",
    colors: p.colors || [],
    colorNames: p.color_names || [],
    stock: p.stock || 0,
    rating: typeof p.rating === "string" ? parseFloat(p.rating) : (p.rating || 0),
    reviews: p.reviews || 0,
    isNew: p.is_new || false,
    relatedProducts: p.related_products || [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Produit introuvable",
      description: "Le produit recherché n'existe pas ou n'est plus disponible.",
    };
  }

  const image =
    product.images?.[0] ||
    "https://www.nomade-artisan.fr/og-image.jpg";

  const description =
    product.description?.trim()
      ? product.description.length > 160
        ? product.description.slice(0, 157) + "..."
        : product.description
      : `${product.name} - création artisanale Nomade fabriquée à la main.`;
  
  return {
    title: `${product.name}`,

    description,

    keywords: [
      product.name,
      "Nomade",
      "maroquinerie artisanale",
      "sac artisanal",
      "sac fait main",
      "fabrication française",
      "cuir",
      "accessoire artisanal",
    ],

    alternates: {
      canonical: `https://www.nomade-artisan.fr/boutique/${product.id}`,
    },

    openGraph: {
      title: `${product.name}`,
      description,
      url: `https://www.nomade-artisan.fr/boutique/${product.id}`,
      siteName: "Nomade",

      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],

      locale: "fr_FR",
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: `${product.name}`,
      description,
      images: [image],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rawProduct = await getProduct(id);

  if (!rawProduct) {
    notFound();
  }

  const product = formatProduct(rawProduct);
  const allProducts = await getAllProducts();

  const relatedProducts = product.relatedProducts
    ? product.relatedProducts
        .map((rid: number) => allProducts.find((p: any) => p.id === rid))
        .filter(Boolean)
        .map(formatProduct)
    : [];

  return (
    <ProductClient product={product} relatedProducts={relatedProducts} />
  );
}