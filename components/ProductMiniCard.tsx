"use client";

import Link from "next/link";
import Image from "next/image";

interface ProductMiniCardProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    images: string[];
  };
}

export default function ProductMiniCard({ product }: ProductMiniCardProps) {
  const imageUrl = product.images?.[0] || "/placeholder.jpg";

  return (
    <Link href={`/produit/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-sm">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 80vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-sm font-light text-stone-800 truncate">
          {product.name}
        </h3>
        <p className="text-sm font-light text-stone-500 mt-1">
          {product.price} €
        </p>
      </div>
    </Link>
  );
}