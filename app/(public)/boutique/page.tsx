// app/boutique/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import BoutiqueClient from "./BoutiqueClient";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Découvrez notre collection de sacs faits main. Cuir, minimal, bandoulière ou aventure : trouvez le sac qui vous portera.",
};

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

async function getProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const products = await res.json();
  return products.map(formatProduct);
}

export default async function BoutiquePage() {
  const products = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <BoutiqueClient products={products} />
    </Suspense>
  );
}