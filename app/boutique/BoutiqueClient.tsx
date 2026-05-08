// app/boutique/BoutiqueClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number | string;
  name: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
  rating?: number;
}

const categories = ["Tous", "Cuir", "Minimal", "Bandoulière", "Aventure"];

const sortOptions = [
  { label: "Par défaut", value: "default" },
  { label: "Prix croissant", value: "price-asc" },
  { label: "Prix décroissant", value: "price-desc" },
  { label: "Nouveautés", value: "newest" },
];

function BoutiqueClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");

  const [activeCategory, setActiveCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Lire les paramètres d'URL au chargement
  useEffect(() => {
    // Réinitialiser
    let category = "Tous";
    let filter: string | null = null;
    let sort = "default";

    // Catégorie
    if (categoryParam) {
      const cat = categories.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (cat) category = cat;
    }

    // Filtre spécial
    if (filterParam) {
      if (filterParam === "nouveautes") {
        filter = "nouveautes";
        category = "Tous";
        sort = "newest";
      }
      if (filterParam === "best" || filterParam === "best-sellers") {
        filter = "best";
        category = "Tous";
      }
    }

    setActiveCategory(category);
    setActiveFilter(filter);
    setSortBy(sort);
  }, [categoryParam, filterParam]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filtre "Best-sellers" (rating >= 4.7)
    if (activeFilter === "best") {
      filtered = filtered.filter((p) => (p.rating || 0) >= 4.7);
    }

    // Filtre "Nouveautés"
    if (activeFilter === "nouveautes") {
      filtered = filtered.filter((p) => p.isNew);
    }

    // Filtre catégorie (seulement si pas de filtre spécial actif, ou si catégorie != Tous)
    if (activeCategory !== "Tous" && !activeFilter) {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    
    // Si on a ET une catégorie ET un filtre
    if (activeCategory !== "Tous" && activeFilter) {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    // Recherche
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

    // Tri
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      default:
        break;
    }

    return filtered;
  }, [activeCategory, sortBy, searchTerm, activeFilter, products]);

  // Titre dynamique
  const pageTitle = activeFilter === "nouveautes"
    ? "Nouveautés"
    : activeFilter === "best"
    ? "Nos essentiels"
    : activeCategory !== "Tous"
    ? activeCategory
    : "La collection";

  const pageSubtitle = activeFilter === "nouveautes"
    ? "Les derniers sacs arrivés."
    : activeFilter === "best"
    ? "Les plus appréciés par notre communauté."
    : activeCategory !== "Tous"
    ? `Nos sacs en ${activeCategory.toLowerCase()}.`
    : "Chaque sac est une invitation au voyage.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-stone-50"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
            {pageTitle}
          </h1>
          <p className="text-stone-500 font-light max-w-md mx-auto">
            {pageSubtitle}
          </p>
        </motion.div>

        {/* Barre de filtres */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-stone-200 pb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveFilter(null);
                }}
                className={`text-sm tracking-wider font-light px-4 py-2 rounded-full border transition-all ${
                  activeCategory === cat && !activeFilter
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700"
                }`}
              >
                {cat}
              </button>
            ))}
            {/* Badges pour Nouveautés et Best-sellers */}
            <button
              onClick={() => {
                setActiveFilter("nouveautes");
                setActiveCategory("Tous");
                setSortBy("newest");
              }}
              className={`text-sm tracking-wider font-light px-4 py-2 rounded-full border transition-all ${
                activeFilter === "nouveautes"
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700"
              }`}
            >
              Nouveautés
            </button>
            <button
              onClick={() => {
                setActiveFilter("best");
                setActiveCategory("Tous");
                setSortBy("default");
              }}
              className={`text-sm tracking-wider font-light px-4 py-2 rounded-full border transition-all ${
                activeFilter === "best"
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700"
              }`}
            >
              Essentiels
            </button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-full px-4 py-2 text-sm font-light text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-stone-200 rounded-full px-3 py-2 text-sm font-light text-stone-600 focus:outline-none focus:border-stone-400 appearance-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compteur */}
        <p className="text-xs text-stone-400 font-light mb-8 tracking-wide">
          {filteredProducts.length} sac{filteredProducts.length > 1 ? "s" : ""}{" "}
          trouvé{filteredProducts.length > 1 ? "s" : ""}
        </p>

        {/* Grille */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key={activeCategory + sortBy + searchTerm + activeFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-stone-400 text-lg font-light mb-4">
                Aucun sac trouvé.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("Tous");
                  setActiveFilter(null);
                  setSearchTerm("");
                  setSortBy("default");
                }}
                className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-700 font-light transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default BoutiqueClient;