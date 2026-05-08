// app/HomeClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number | string;
  name: string;
  price: number;
  images: string[];
  category: string;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
}

function HomeClient() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>([]);

  // Charger les produits depuis l'API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
          images: p.images || [],
          category: p.category || "",
          isNew: p.is_new || false,
          rating: typeof p.rating === "string" ? parseFloat(p.rating) : (p.rating || 0),
          reviews: p.reviews || 0,
        }));
        setProducts(formatted);
      })
      .catch(console.error);
  }, []);

  // Observer pour les animations au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-section]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Filtrer les produits
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const bestProducts = products
    .filter((p) => (p.rating || 0) >= 4.7)
    .slice(0, 4);
  const categories = [
    { name: "Cuir", slug: "Cuir", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3" },
    { name: "Minimal", slug: "Minimal", img: "https://images.unsplash.com/photo-1591561954557-26941169b49e" },
    { name: "Bandoulière", slug: "Bandoulière", img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519" },
    { name: "Aventure", slug: "Aventure", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7" },
  ];

  const values = [
    {
      title: "Fait main",
      text: "Chaque pièce est cousue une à une. Par des mains qui savent que le temps fait bien les choses.",
      img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a",
    },
    {
      title: "Pour durer",
      text: "On ne crée pas pour la saison. On crée pour la route. Des matières qui se bonifient avec les kilomètres.",
      img: "https://images.unsplash.com/photo-1576595580361-90a855b84b20",
    },
    {
      title: "L'essentiel",
      text: "Pas de logo visible. Pas de bruit. Juste un sac qui porte ce que vous décidez d'y mettre.",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    },
  ];

  const testimonials = [
    {
      quote: "Un sac qui a de l'âme. On sent le travail de la main. Je ne le quitte plus.",
      author: "— Marie, Paris",
    },
    {
      quote: "Il devient plus beau en voyageant. Comme nous.",
      author: "— Luc, Marseille",
    },
  ];

  return (
    <div className="bg-stone-50 text-stone-900">
      {/* ========== HERO ========== */}
      <section className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Overlay plus profond */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-stone-900/10 to-stone-900/60" />

        {/* Contenu */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
            <div className="max-w-2xl">
              {/* Tag */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-white/50 text-xs md:text-sm tracking-[0.3em] uppercase mb-6 font-light"
              >
                Nouvelle collection • Automne 2024
              </motion.p>

              {/* Titre */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-6xl md:text-8xl lg:text-9xl font-light text-white mb-4 tracking-wide leading-none"
              >
                Nomade
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-white/60 text-lg md:text-2xl font-light mb-4 leading-relaxed"
              >
                Des sacs pour ceux qui savent que l&apos;essentiel
                <br />
                est à l&apos;intérieur
              </motion.p>

              {/* Ligne décorative */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "4rem" }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="h-px bg-white/30 mb-10"
              />

              {/* Citation discrète */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-white/40 text-sm font-light italic mb-10 max-w-md"
              >
                "On ne possède que ce qu&apos;on porte"
              </motion.p>

              {/* Boutons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/boutique"
                  className="group bg-white text-stone-900 px-8 py-4 rounded-full text-sm tracking-wider font-light hover:bg-stone-100 transition-all inline-flex items-center gap-3"
                >
                  Voir la collection
                </Link>
                <Link
                  href="/boutique?filter=nouveautes"
                  className="border border-white/30 text-white px-8 py-4 rounded-full text-sm tracking-wider font-light hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Nouveautés
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">
              Défiler
            </span>
            <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center p-1.5">
              <div className="w-0.5 h-2 bg-white/50 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== INTRODUCTION ========== */}
      <section className="py-24 md:py-36">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-8 tracking-wide leading-tight">
                Ce qu&apos;on porte parle de là où on va
              </h2>
              <p className="text-stone-500 font-light text-lg leading-relaxed">
                Chaque sac Nomade est fabriqué à la main. Pas pour le luxe.
                Pour durer. Pour traverser. Pour celles et ceux qui avancent
                avec peu, mais avec tout ce qui compte.
              </p>
              <div className="mt-8">
                <Link
                  href="/boutique"
                  className="text-stone-500 hover:text-stone-800 font-light tracking-wide transition-colors inline-flex items-center gap-2 group"
                >
                  Découvrir la collection
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-2xl overflow-hidden aspect-[4/5]"
            >
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== CATÉGORIES ========== */}
      <section className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-light mb-12 tracking-wide text-center"
          >
            Explorez par style
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/boutique?category=${cat.slug}`}
                  className="group block relative overflow-hidden rounded-xl aspect-square bg-stone-200"
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-light tracking-wide">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== NOUVEAUTÉS ========== */}
      <section id="new-products" data-section className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible["new-products"] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-3">
              Collection
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide">
              Nouveautés
            </h2>
          </motion.div>

          {newProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["new-products"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.12, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 font-light text-center py-10">
              Les nouveautés arrivent bientôt.
            </p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible["new-products"] ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center mt-14"
          >
            <Link
              href="/boutique"
              className="text-stone-400 hover:text-stone-700 font-light tracking-wide transition-colors inline-flex items-center gap-2 group"
            >
              Voir toute la collection
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== IMAGE SILENCIEUSE ========== */}
      <section className="h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1533130061792-64b345e4a833"
          alt=""
          className="w-full h-full object-cover"
        />
      </section>

      {/* ========== VALEURS ========== */}
      <section id="values" data-section className="py-24 md:py-36 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-light mb-16 text-center tracking-wide"
          >
            Ce qui fait Nomade
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="rounded-xl overflow-hidden aspect-square mb-6 bg-stone-100">
                  <img
                    src={value.img}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-xl font-light mb-3 tracking-wide">
                  {value.title}
                </h3>
                <p className="text-stone-500 font-light text-sm leading-relaxed max-w-xs mx-auto">
                  {value.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BEST-SELLERS ========== */}
      <section id="best-sellers" data-section className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible["best-sellers"] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-3">
              Populaires
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide">
              Nos essentiels
            </h2>
          </motion.div>

          {bestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["best-sellers"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.12, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 font-light text-center py-10">
              Les best-sellers arrivent bientôt.
            </p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible["best-sellers"] ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center mt-14"
          >
            <Link
              href="/boutique"
              className="text-stone-400 hover:text-stone-700 font-light tracking-wide transition-colors inline-flex items-center gap-2 group"
            >
              Voir tous les sacs
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== TÉMOIGNAGES ========== */}
      <section className="py-24 md:py-36 bg-stone-50">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-8"
          >
            Ils portent Nomade
          </motion.p>
          <div className="grid md:grid-cols-2 gap-10">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-xl md:text-2xl font-light italic text-stone-600 leading-relaxed"
              >
                &ldquo;{t.quote}&rdquo;
                <footer className="text-sm text-stone-400 mt-4 not-italic">
                  {t.author}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOMMAGE SILENCIEUX ========== */}
      <section className="py-24 md:py-36 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl overflow-hidden aspect-[4/5]"
            >
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-6">
                Ce qui nous porte
              </p>
              <blockquote className="text-2xl md:text-3xl font-light italic leading-relaxed text-white/80">
                &ldquo;Parfois ce sont des inconnus qui nous rappellent
                qu&apos;on n&apos;est pas seul. Ce sac est un hommage silencieux
                à toutes les mains qui se sont tendues.&rdquo;
              </blockquote>
              <p className="text-white/40 text-sm mt-8 font-light">
                — L&apos;esprit Nomade
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== APPEL FINAL ========== */}
      <section className="py-24 md:py-36">
        <div className="max-w-xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6 tracking-wide">
              Un sac. Une route.
            </h2>
            <p className="text-stone-500 font-light mb-10 text-lg">
              Il n&apos;y a pas de hasard. Si vous êtes là, c&apos;est que vous cherchez
              l&apos;essentiel vous aussi.
            </p>
            <Link
              href="/boutique"
              className="inline-block bg-stone-900 text-white px-10 py-4 text-sm tracking-wider font-light hover:bg-stone-800 transition-colors rounded-full"
            >
              Découvrir Nomade
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomeClient;