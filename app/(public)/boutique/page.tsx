import { getProductsList } from "@/lib/products/queries";
import BoutiqueClient from "./BoutiqueClient";

export default async function BoutiquePage() {
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