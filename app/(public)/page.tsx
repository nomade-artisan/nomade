import HomeClient from "./HomeClient";
import { getCollections } from "@/lib/collections/queries";
import { getProductsList } from "@/lib/products/queries";
export const revalidate = 60

export default async function Home() {
  const [collections, { data }] = await Promise.all([
    getCollections(),
    getProductsList({
      pageSize: 50,
      status: "active",
    }),
  ]);

  const initialProducts = data.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    images: product.cover_image ? [product.cover_image] : [],
    category: product.category_name || "",
    collectionSlug: product.collection_slug || null,
    isNew: product.is_new || false,
    rating: 0,
    reviews: 0,
  }));

  return <HomeClient collections={collections} initialProducts={initialProducts} />;
}