// app/boutique/BoutiqueClient.tsx

"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";

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

const categories = [
  "Tous",
  "Cuir",
  "Minimal",
  "Bandoulière",
  "Aventure",
];

const sortOptions = [
  { label: "Par défaut", value: "default" },
  { label: "Prix croissant", value: "price-asc" },
  { label: "Prix décroissant", value: "price-desc" },
  { label: "Nouveautés", value: "newest" },
];

function BoutiqueClient({
  products,
}: {
  products: Product[];
}) {
  const searchParams = useSearchParams();

  const categoryParam =
    searchParams.get("category");

  const filterParam =
    searchParams.get("filter");

  const [activeCategory, setActiveCategory] =
    useState("Tous");

  const [sortBy, setSortBy] =
    useState("default");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<string | null>(null);

  const [sortMenuOpen, setSortMenuOpen] =
    useState(false);

  const sortMenuRef =
    useRef<HTMLDivElement>(null);

  // CLOSE SORT MENU

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // URL PARAMS

  useEffect(() => {
    let category = "Tous";
    let filter: string | null = null;
    let sort = "default";

    if (categoryParam) {
      const cat = categories.find(
        (c) =>
          c.toLowerCase() ===
          categoryParam.toLowerCase()
      );

      if (cat) category = cat;
    }

    if (filterParam) {
      if (filterParam === "nouveautes") {
        filter = "nouveautes";
        category = "Tous";
        sort = "newest";
      }

      if (
        filterParam === "best" ||
        filterParam === "best-sellers"
      ) {
        filter = "best";
        category = "Tous";
      }
    }

    setActiveCategory(category);
    setActiveFilter(filter);
    setSortBy(sort);
  }, [categoryParam, filterParam]);

  // FILTERS

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeFilter === "best") {
      filtered = filtered.filter(
        (p) => (p.rating || 0) >= 4.7
      );
    }

    if (activeFilter === "nouveautes") {
      filtered = filtered.filter(
        (p) => p.isNew
      );
    }

    if (
      activeCategory !== "Tous" &&
      !activeFilter
    ) {
      filtered = filtered.filter(
        (p) =>
          p.category === activeCategory
      );
    }

    if (
      activeCategory !== "Tous" &&
      activeFilter
    ) {
      filtered = filtered.filter(
        (p) =>
          p.category === activeCategory
      );
    }

    if (searchTerm.trim() !== "") {
      const term =
        searchTerm.toLowerCase();

      filtered = filtered.filter(
        (p) =>
          p.name
            .toLowerCase()
            .includes(term) ||
          p.category
            .toLowerCase()
            .includes(term)
      );
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort(
          (a, b) => a.price - b.price
        );
        break;

      case "price-desc":
        filtered.sort(
          (a, b) => b.price - a.price
        );
        break;

      case "newest":
        filtered.sort(
          (a, b) =>
            Number(b.id) -
            Number(a.id)
        );
        break;

      default:
        break;
    }

    return filtered;
  }, [
    activeCategory,
    sortBy,
    searchTerm,
    activeFilter,
    products,
  ]);

  // TITLES

  const pageTitle =
    activeFilter === "nouveautes"
      ? "Nouveautés"
      : activeFilter === "best"
      ? "Essentiels"
      : activeCategory !== "Tous"
      ? activeCategory
      : "La collection";

  const pageSubtitle =
    activeFilter === "nouveautes"
      ? "Les dernières pièces."
      : activeFilter === "best"
      ? "Les modèles les plus appréciés."
      : activeCategory !== "Tous"
      ? `Une sélection ${activeCategory.toLowerCase()}.`
      : "Des objets pensés pour durer.";

  const currentSortLabel =
    sortOptions.find(
      (opt) => opt.value === sortBy
    )?.label || "Par défaut";

  return (
    <div className="bg-stone-50 overflow-hidden pt-20">

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">

        {/* HERO */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="text-center mb-12 md:mb-14"
        >

          <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-4">
            {pageTitle}
          </h1>

          <p className="text-stone-500 font-light text-lg leading-relaxed max-w-md mx-auto">
            {pageSubtitle}
          </p>

        </motion.div>

        {/* FILTER BAR */}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 border-b border-stone-200/70 pb-8">

          {/* CATEGORIES */}

          <div className="flex flex-wrap gap-2">

            {categories.map((cat) => (

              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveFilter(null);
                }}
                className={`text-[11px] uppercase tracking-[0.18em] font-light px-3 py-1.5 rounded-full border transition-all duration-300
                  ${
                    activeCategory === cat &&
                    !activeFilter
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white/70 backdrop-blur-sm text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800"
                  }`}
              >
                {cat}
              </button>

            ))}

            {/* NEW */}

            <button
              onClick={() => {
                setActiveFilter(
                  "nouveautes"
                );
                setActiveCategory("Tous");
                setSortBy("newest");
              }}
              className={`text-[11px] uppercase tracking-[0.18em] font-light px-3 py-1.5 rounded-full border transition-all duration-300
                ${
                  activeFilter ===
                  "nouveautes"
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white/70 backdrop-blur-sm text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800"
                }`}
            >
              Nouveautés
            </button>

            {/* BEST */}

            <button
              onClick={() => {
                setActiveFilter("best");
                setActiveCategory("Tous");
                setSortBy("default");
              }}
              className={`text-[11px] uppercase tracking-[0.18em] font-light px-3 py-1.5 rounded-full border transition-all duration-300
                ${
                  activeFilter === "best"
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white/70 backdrop-blur-sm text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800"
                }`}
            >
              Essentiels
            </button>

          </div>

          {/* RIGHT */}

          <div className="flex gap-3 w-full lg:w-auto">

            {/* SEARCH */}

            <div className="relative flex-1 lg:w-52">

              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="w-full bg-white/70 backdrop-blur-sm border border-stone-200 rounded-full px-5 py-2.5 text-sm font-light text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
              />

            </div>

            {/* PREMIUM SORT */}

            <div
              ref={sortMenuRef}
              className="relative"
            >

              <button
                onClick={() =>
                  setSortMenuOpen(
                    !sortMenuOpen
                  )
                }
                className="bg-white/70 backdrop-blur-sm border border-stone-200 rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] font-light text-stone-600 hover:border-stone-400 transition-all duration-300 flex items-center gap-3"
              >

                {currentSortLabel}

                <motion.span
                  animate={{
                    rotate:
                      sortMenuOpen
                        ? 180
                        : 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="text-stone-400"
                >
                  ↓
                </motion.span>

              </button>

              {/* DROPDOWN */}

              <AnimatePresence>

                {sortMenuOpen && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 6,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-xl border border-stone-200/70 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] z-40"
                  >

                    {sortOptions.map(
                      (option) => (

                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(
                              option.value
                            );

                            setSortMenuOpen(
                              false
                            );
                          }}
                          className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors text-sm font-light
                            ${
                              sortBy ===
                              option.value
                                ? "text-stone-900 bg-stone-50"
                                : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                            }`}
                        >

                          <span>
                            {option.label}
                          </span>

                          {sortBy ===
                            option.value && (
                            <span className="text-stone-900">
                              •
                            </span>
                          )}

                        </button>

                      )
                    )}

                  </motion.div>

                )}

              </AnimatePresence>

            </div>

          </div>

        </div>

        {/* COUNT */}

        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-light mb-10">
          {filteredProducts.length} produit
          {filteredProducts.length > 1
            ? "s"
            : ""}
        </p>

        {/* GRID */}

        <AnimatePresence mode="wait">

          {filteredProducts.length >
          0 ? (

            <motion.div
              key={
                activeCategory +
                sortBy +
                searchTerm +
                activeFilter
              }
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              transition={{
                duration: 0.25,
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
            >

              {filteredProducts.map(
                (product) => (

                  <ProductCard
                    key={product.id}
                    product={product}
                  />

                )
              )}

            </motion.div>

          ) : (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="text-center py-24"
            >

              <div className="w-10 h-px bg-stone-300 mx-auto mb-8" />

              <p className="text-stone-500 text-lg font-light mb-6">
                Aucun produit trouvé.
              </p>

              <button
                onClick={() => {
                  setActiveCategory(
                    "Tous"
                  );

                  setActiveFilter(
                    null
                  );

                  setSearchTerm("");

                  setSortBy(
                    "default"
                  );
                }}
                className="text-sm text-stone-400 hover:text-stone-700 underline underline-offset-4 font-light transition-colors"
              >
                Réinitialiser les filtres
              </button>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    </div>
  );
}

export default BoutiqueClient;