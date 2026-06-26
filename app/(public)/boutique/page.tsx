import { Suspense } from "react";
import { getProductsList } from "@/lib/products/queries";
import BoutiqueClient from "./BoutiqueClient";

export default function BoutiquePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    }>
      <BoutiqueContent />
    </Suspense>
  );
}

async function BoutiqueContent() {
  const { data } = await getProductsList({
    pageSize: 50,
    status: "active",
  });

  const products = data.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    images: p.cover_image ? [p.cover_image] : [],
    category: p.category_name || "",
    isNew: p.is_new,
    rating: 0,
  }));

  return <BoutiqueClient products={products} />;
}