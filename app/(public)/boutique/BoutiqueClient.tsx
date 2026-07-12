"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/tracking";


// Types
interface Product {
  id: number | string;
  name: string;
  price: number;
  images: string[];
  category: string;
  categorySlug: string;
  collection: string;
  collectionSlug: string;
  isNew?: boolean;
  rating?: number;
}

interface CategoryFilter {
  id: number;
  name: string;
  slug: string;
  collectionId: number;
  collectionName: string;
  collectionSlug: string;
}

interface CollectionFilter {
  id: number;
  name: string;
  slug: string;
}

function normalizeCategory(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const sortOptions = [
  { label: "Par défaut", value: "default" },
  { label: "Prix croissant", value: "price-asc" },
  { label: "Prix décroissant", value: "price-desc" },
  { label: "Nouveautés", value: "newest" },
];

function BoutiqueClient({
  products,
  categories,
  collections,
}: {
  products: Product[];
  categories: CategoryFilter[];
  collections: CollectionFilter[];
}) {
  const searchParams = useSearchParams();
  const collectionParam = searchParams.get("collection");
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");

  const availableCollections = useMemo(() => collections, [collections]);

  const availableCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((category) => {
      const normalized = normalizeCategory(category.slug);
      if (!normalized || seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  }, [categories]);

  // États
  const [activeCollection, setActiveCollection] = useState("Tous");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Tracking
  useEffect(() => {
    if (activeCategory === "Tous") return;
    trackEvent("category_view", {
      metadata: { collection: activeCollection, category: activeCategory },
    });
  }, [activeCategory, activeCollection]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) return;
    const timeout = setTimeout(() => {
      trackEvent("search", {
        metadata: { query: searchTerm.trim() },
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Initialisation depuis les paramètres d'URL
  useMemo(() => {
    let category = "Tous";
    let collection = "Tous";
    let filter: string | null = null;
    let sort = "default";

    if (collectionParam) {
      const collectionMatch = availableCollections.find(
        (item) => normalizeCategory(item.slug) === normalizeCategory(collectionParam)
      );
      if (collectionMatch) collection = collectionMatch.name;
    }

    if (categoryParam) {
      const cat = availableCategories.find(
        (c) => normalizeCategory(c.slug) === normalizeCategory(categoryParam)
      );
      if (cat) {
        category = cat.name;
        if (cat.collectionName) collection = cat.collectionName;
      }
    }

    if (filterParam) {
      if (filterParam === "nouveautes") {
        filter = "nouveautes";
        category = "Tous";
        sort = "newest";
      } else if (filterParam === "best" || filterParam === "best-sellers") {
        filter = "best";
        category = "Tous";
      }
    }

    setActiveCollection(collection);
    setActiveCategory(category);
    setActiveFilter(filter);
    setSortBy(sort);
  }, [availableCategories, availableCollections, categoryParam, collectionParam, filterParam]);

  // Filtrage et tri (côté client car données déjà chargées)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeFilter === "best") {
      filtered = filtered.filter((p) => (p.rating || 0) >= 4.7);
    }
    if (activeFilter === "nouveautes") {
      filtered = filtered.filter((p) => p.isNew);
    }
    if (activeCollection !== "Tous") {
      filtered = filtered.filter((p) => p.collection === activeCollection);
    }
    if (activeCategory !== "Tous") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

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
    }

    return filtered;
  }, [activeCategory, activeCollection, sortBy, searchTerm, activeFilter, products]);

  const visibleCategories = useMemo(() => {
    if (activeCollection === "Tous") return availableCategories;
    return availableCategories.filter((category) => category.collectionName === activeCollection);
  }, [activeCollection, availableCategories]);

  // Handlers
  const handleCollectionChange = useCallback(
    (collection: string) => {
      if (collection === activeCollection && activeCategory === "Tous" && !activeFilter) return;
      setTransitioning(true);
      setTimeout(() => {
        setActiveCollection(collection);
        setActiveCategory("Tous");
        setActiveFilter(null);
        setTransitioning(false);
      }, 150);
    },
    [activeCategory, activeCollection, activeFilter]
  );

  const handleCategoryChange = useCallback(
    (cat: string) => {
      if (cat === activeCategory && !activeFilter) return;
      setTransitioning(true);
      setTimeout(() => {
        setActiveCategory(cat);
        setActiveFilter(null);
        const found = availableCategories.find((category) => category.name === cat);
        if (found?.collectionName) {
          setActiveCollection(found.collectionName);
        }
        setTransitioning(false);
      }, 150);
    },
    [activeCategory, activeFilter, availableCategories]
  );

  const handleNewFilter = useCallback(() => {
    if (activeFilter === "nouveautes") return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveFilter("nouveautes");
        setActiveCollection("Tous");
      setActiveCategory("Tous");
      setSortBy("newest");
      setTransitioning(false);
    }, 150);
  }, [activeFilter]);

  const handleBestFilter = useCallback(() => {
    if (activeFilter === "best") return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveFilter("best");
        setActiveCollection("Tous");
      setActiveCategory("Tous");
      setTransitioning(false);
    }, 150);
  }, [activeFilter]);

  // Titre dynamique
  const pageTitle =
    activeFilter === "nouveautes"
      ? "Nouveautés"
      : activeFilter === "best"
        ? "Essentiels"
        : activeCategory !== "Tous"
          ? activeCategory
          : activeCollection !== "Tous"
            ? activeCollection
          : "La collection";

  const pageSubtitle =
    activeFilter === "nouveautes"
      ? "Les dernières pièces."
      : activeFilter === "best"
        ? "Les modèles les plus appréciés."
        : activeCategory !== "Tous"
          ? `Une sélection ${activeCategory.toLowerCase()}.`
          : activeCollection !== "Tous"
            ? `Explore la collection ${activeCollection.toLowerCase()}.`
          : "Des objets pensés pour durer";

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Par défaut";

  return (
    <div className="bg-stone-50 overflow-hidden pt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Entête */}
        <div className="text-center mb-12 md:mb-14">
          <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            {pageTitle}
          </h1>
          <p className="text-stone-500 font-light text-lg leading-relaxed max-w-md mx-auto">
            {pageSubtitle}
          </p>
        </div>

        {/* Barre de filtres */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 border-b border-stone-200/70 pb-8">
          {/* Catégories */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableCollections.map((collection) => (
                <button
                  key={collection.slug}
                  onClick={() => handleCollectionChange(collection.name)}
                  className={`text-[11px] uppercase tracking-[0.18em] font-light px-3 py-1.5 rounded-full border transition-all duration-300 ${
                    activeCollection === collection.name && !activeFilter
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white/70 backdrop-blur-sm text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800"
                  }`}
                >
                  {collection.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
            {visibleCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.name)}
                className={`text-[11px] uppercase tracking-[0.18em] font-light px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  activeCategory === cat.name && !activeFilter
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white/70 backdrop-blur-sm text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
            </div>

            <button
              onClick={handleNewFilter}
              className={`text-[11px] uppercase tracking-[0.18em] font-light px-3 py-1.5 rounded-full border transition-all duration-300 ${
                activeFilter === "nouveautes"
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white/70 backdrop-blur-sm text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800"
              }`}
            >
              Nouveautés
            </button>

            <button
              onClick={handleBestFilter}
              className={`text-[11px] uppercase tracking-[0.18em] font-light px-3 py-1.5 rounded-full border transition-all duration-300 ${
                activeFilter === "best"
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white/70 backdrop-blur-sm text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800"
              }`}
            >
              Essentiels
            </button>
          </div>

          {/* Recherche + Tri */}
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-52">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/70 backdrop-blur-sm border border-stone-200 rounded-full px-5 py-2.5 text-sm font-light text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
              />
            </div>

            {/* Menu de tri */}
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                onBlur={() => setTimeout(() => setSortMenuOpen(false), 200)}
                className="bg-white/70 backdrop-blur-sm border border-stone-200 rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] font-light text-stone-600 hover:border-stone-400 transition-all duration-300 flex items-center gap-3"
              >
                {currentSortLabel}
                <span
                  className={`text-stone-400 transition-transform duration-200 ${
                    sortMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {sortMenuOpen && (
                <div className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-xl border border-stone-200/70 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] z-40">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setSortMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors text-sm font-light ${
                        sortBy === option.value
                          ? "text-stone-900 bg-stone-50"
                          : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <span className="text-stone-900">•</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nombre de produits */}
        {filteredProducts.length > 0 && (
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-light mb-10">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""}
          </p>
        )}

        {/* Grille */}
        <div
          className={`transition-opacity duration-300 ${
            transitioning
              ? "opacity-0 translate-y-2"
              : "opacity-100 translate-y-0"
          } motion-safe:transition-all`}
        >
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {filteredProducts.map((product) => (
                <MemoizedProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-10 h-px bg-stone-300 mx-auto mb-8" />
              <p className="text-stone-500 text-lg font-light mb-6">
                Aucun produit trouvé.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("Tous");
                  setActiveFilter(null);
                  setSearchTerm("");
                  setSortBy("default");
                }}
                className="text-sm text-stone-400 hover:text-stone-700 underline underline-offset-4 font-light transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize ProductCard
const MemoizedProductCard = memo(ProductCard);

export default BoutiqueClient;