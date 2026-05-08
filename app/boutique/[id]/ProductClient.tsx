// app/boutique/[id]/ProductClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/CartContext";

interface Product {
  id: number | string;
  name: string;
  price: number;
  images: string[];
  description: string;
  details: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  isNew: boolean;
}

function ProductClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        stock: product.stock,
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-stone-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-16">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm font-light text-stone-400 mb-8"
        >
          <Link href="/" className="hover:text-stone-800 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link
            href="/boutique"
            className="hover:text-stone-800 transition-colors"
          >
            Boutique
          </Link>
          <span>/</span>
          <span className="text-stone-700">{product.name}</span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Galerie images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Image principale */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-100 aspect-square">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]}
                  alt={`${product.name} - Vue ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>

              {product.isNew && (
                <div className="absolute top-4 left-4">
                  <span className="bg-stone-900 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Nouveau
                  </span>
                </div>
              )}

              {product.stock <= 3 && product.stock > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Plus que {product.stock}
                  </span>
                </div>
              )}

              {/* Indicateurs */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === selectedImage
                        ? "bg-stone-900 w-8"
                        : "bg-stone-300 hover:bg-stone-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Miniatures */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden aspect-square bg-stone-100 border-2 transition-all ${
                    index === selectedImage
                      ? "border-stone-900"
                      : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Infos produit */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Catégorie + rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-500"
                        : "text-stone-200"
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-sm text-stone-400 ml-2 font-light">
                  ({product.reviews} avis)
                </span>
              </div>
            </div>

            {/* Nom + prix */}
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-light">
                  {typeof product.price === "number"
                    ? product.price.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })
                    : product.price}{" "}
                  €
                </span>
                <span className="text-sm text-stone-400 font-light">
                  Taxes incluses
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-stone-600 font-light leading-relaxed text-base">
              {product.description}
            </p>

            {/* Quantité + ajout panier */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-light text-stone-500">
                  Quantité :
                </span>
                <div className="flex items-center border border-stone-200 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-light text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
                {product.stock <= 3 && (
                  <span className="text-xs text-amber-600 font-light">
                    Seulement {product.stock} en stock
                  </span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 rounded-full text-sm tracking-[0.15em] uppercase font-light transition-all ${
                  isAdded
                    ? "bg-green-600 text-white"
                    : product.stock === 0
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
              >
                {isAdded
                  ? "✓ Ajouté au panier"
                  : product.stock === 0
                  ? "Rupture de stock"
                  : "Ajouter au panier"}
              </motion.button>
            </div>

            {/* Livraison */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-stone-200">
              {[
                { label: "Livraison 3-5 jours", icon: "📦" },
                { label: "Retours gratuits", icon: "🔄" },
                { label: "Paiement sécurisé", icon: "🔒" },
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="text-lg mb-1">{feature.icon}</div>
                  <p className="text-[11px] text-stone-500 font-light">
                    {feature.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="pt-2">
              <div className="flex border-b border-stone-200">
                {[
                  { key: "description", label: "Description" },
                  { key: "details", label: "Détails" },
                  { key: "livraison", label: "Livraison" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3 text-xs tracking-wider uppercase font-light transition-all ${
                      activeTab === tab.key
                        ? "text-stone-900 border-b-2 border-stone-900"
                        : "text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-light text-stone-600 text-sm leading-relaxed"
                  >
                    {activeTab === "description" && (
                      <p>{product.description}</p>
                    )}
                    {activeTab === "details" && (
                      <ul className="space-y-2">
                        {product.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-center gap-2"
                          >
                            <span className="text-stone-400">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeTab === "livraison" && (
                      <div className="space-y-3">
                        <p>Livraison standard : 3-5 jours ouvrés</p>
                        <p>Livraison express : 1-2 jours ouvrés</p>
                        <p className="text-emerald-700">
                          Gratuite à partir de 150€
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Produits liés */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-20"
          >
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-center tracking-wide">
              Vous pourriez aussi aimer
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map((related) => (
                <Link
                  key={related.id}
                  href={`/boutique/${related.id}`}
                  className="group"
                >
                  <div className="rounded-xl overflow-hidden bg-stone-100 aspect-square mb-3">
                    <img
                      src={related.images[0]}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-light text-sm">{related.name}</h3>
                  <p className="text-stone-500 text-sm font-light">
                    {typeof related.price === "number"
                      ? related.price.toLocaleString("fr-FR")
                      : related.price}{" "}
                    €
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default ProductClient;