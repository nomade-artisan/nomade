"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Product {
  id: number | string;
  name: string;
  price: number;
  images?: string[] | string;
  category?: string;
}

function ProductCard({ product }: { product: Product }) {
  // Prendre la première image (tableau ou chaîne)
  const imageUrl = Array.isArray(product.images)
    ? product.images[0]
    : product.images || "";

  // Formater le prix
  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  return (
    <Link href={`/boutique/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-stone-200 aspect-[3/4] mb-4">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-4xl font-light">
            N
          </div>
        )}
      </div>
      <h3 className="font-light text-base">{product.name}</h3>
      <p className="text-stone-500 font-light text-sm">{price} €</p>
    </Link>
  );
}

export default ProductCard;