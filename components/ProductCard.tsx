"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Product {
  id: number | string;
  name: string;
  price: number;
  images?: string[] | string;
  category?: string;
  stock?: number;
}

function ProductCard({ product }: { product: Product }) {
  const imageUrl = Array.isArray(product.images)
    ? product.images[0]
    : product.images || "";

  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  const stock = product.stock;

  return (
    <Link href={`/boutique/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-stone-200 aspect-[3/4] mb-4 relative">
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

        {/* Badge stock */}
        {stock !== undefined && stock <= 3 && stock > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-light tracking-wide">
              Plus que {stock}
            </span>
          </div>
        )}

        {stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-stone-800 text-white text-xs px-4 py-1.5 rounded-full font-light tracking-wide">
              Épuisé
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-baseline">
        <h3 className="font-light text-base">{product.name}</h3>
        {stock !== undefined && stock > 3 && (
          <span className="text-[10px] text-emerald-600 font-light tracking-wide">
            En stock
          </span>
        )}
      </div>

      <p className="text-stone-500 font-light text-sm">{price} €</p>
    </Link>
  );
}

export default ProductCard;