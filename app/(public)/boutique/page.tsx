import { Suspense } from "react";
import { getProductsList } from "@/lib/products/queries";
import { getCategories } from "@/lib/categories/queries";
import { getCollections } from "@/lib/collections/queries";
import BoutiqueClient from "./BoutiqueClient";

export const revalidate = 20; // Revalidation every 20 seconds

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
  const [{ data }, categoryRecords, collectionRecords] = await Promise.all([
    getProductsList({
      pageSize: 50,
      status: "active",
    }),
    getCategories(),
    getCollections(),
  ]);

  const products = data.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    images: p.cover_image ? [p.cover_image] : [],
    categorySlug: p.category_slug || "",
    category: p.category_name || "",
    collectionSlug: p.collection_slug || "",
    collection: p.collection_name || "",
    isNew: p.is_new,
    rating: 0,
  }));

  const categories = categoryRecords.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    collectionId: category.collection_id,
    collectionName: category.collection?.name || "",
    collectionSlug: category.collection?.slug || "",
  }));

  const collections = [
    { id: 0, name: "Tous", slug: "all" },
    ...collectionRecords.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
    })),
  ];

  return <BoutiqueClient products={products} categories={categories} collections={collections} />;
}