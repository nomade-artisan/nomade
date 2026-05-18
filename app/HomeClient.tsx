
// app/HomeClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/db";

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

const homeImage = (filename: string) =>
  supabase.storage.from("home").getPublicUrl(`home/${filename}`).data.publicUrl;

function HomeClient() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.15 }
    );

    document
      .querySelectorAll("[data-section]")
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const bestProducts = products.filter((p) => (p.rating || 0) >= 4.7).slice(0, 4);

  const categories = [
    {
      name: "Cuir",
      slug: "Cuir",
      img: homeImage("cat-cuir.jpg"),
    },
    {
      name: "Minimal",
      slug: "Minimal",
      img: homeImage("cat-minimal.jpg"),
    },
    {
      name: "Bandoulière",
      slug: "Bandouliere",
      img: homeImage("cat-bandouliere.jpg"),
    },
    {
      name: "Route",
      slug: "Aventure",
      img: homeImage("cat-aventure.jpg"),
    },
  ];

  const values = [
    {
      title: "Fabriqué lentement",
      text:
        "Chaque sac prend du temps. Parce qu’on croit encore qu’un objet qu’on garde longtemps mérite de ne pas être fabriqué dans l’urgence.",
      img: homeImage("valeur-artisanat.jpg"),
    },
    {
      title: "Pensé pour traverser",
      text:
        "Les saisons changent. Les villes changent. Les gens changent aussi parfois. Certains objets restent. Nous fabriquons ceux-là.",
      img: homeImage("valeur-durer.jpg"),
    },
    {
      title: "L’essentiel suffit",
      text:
        "Il y a des périodes où l’on comprend que l’on possède déjà assez. Alors on apprend à choisir ce qu’on porte vraiment avec soi.",
      img: homeImage("valeur-essentiel.jpg"),
    },
  ];

  const testimonials = [
    {
      quote:
        "Je pensais acheter un simple sac. Finalement j’ai gardé quelque chose qui m’accompagne partout depuis deux ans.",
      author: "— Claire, Lyon",
    },
    {
      quote:
        "Quand je l’ai reçu, j’ai eu l’impression qu’il avait déjà une histoire. C’est étrange à dire, mais peu d’objets donnent cette sensation aujourd’hui.",
      author: "— Mehdi, Bruxelles",
    },
  ];

  return (
    <div className="bg-stone-50 text-stone-900 overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src={homeImage("hero.jpg")}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        <div className="relative h-full flex items-end pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
            <div className="max-w-3xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase mb-6 font-light"
              >
                Artisanat • Cuir • Toile
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-6xl md:text-8xl lg:text-9xl font-light text-white mb-8 tracking-wide leading-none"
              >
                Nomade
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="space-y-4 mb-10"
              >
                <p className="text-white text-2xl md:text-4xl font-light leading-tight max-w-3xl">
                  Il y a des périodes où toute une vie tient dans un seul sac.
                </p>

                <p className="text-white/60 text-base md:text-xl font-light leading-relaxed max-w-xl">
                  Des sacs faits lentement, pour celles et ceux qui avancent avec peu,
                  mais avec tout ce qui compte.
                </p>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "4rem" }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="h-px bg-white/30 mb-8"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="text-white/40 italic text-sm md:text-base mb-10 max-w-md leading-relaxed"
              >
                Certains objets transportent plus que des affaires.
                <br />
                Ils transportent une période de notre vie.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/boutique"
                  className="bg-white text-stone-900 px-8 py-4 rounded-full text-sm tracking-wider font-light hover:bg-stone-100 transition-all"
                >
                  Découvrir les sacs
                </Link>

                <Link
                  href="/histoire"
                  className="border border-white/20 text-white px-8 py-4 rounded-full text-sm tracking-wider font-light hover:bg-white/10 transition-all"
                >
                  Lire l’histoire
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTRO ================= */}
      <section className="py-24 md:py-36 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-6">
                Pourquoi Nomade
              </p>

              <h2 className="text-3xl md:text-5xl font-light mb-8 leading-tight tracking-wide">
                Né d’un moment où tout changeait.
              </h2>

              <div className="space-y-6 text-stone-500 text-lg leading-relaxed font-light">
                <p>
                  Changer de ville. Recommencer. Porter sa vie dans peu de choses.
                  Comprendre que certains objets deviennent presque des compagnons.
                </p>

                <p>
                  Alors nous avons voulu créer des sacs simples, solides.
                  Des objets qui suivent une route sans à attirer le regard.
                </p>

                <p>
                  Des sacs qui vieillissent avec le temps au lieu de disparaître avec les tendances.
                </p>
              </div>

              <div className="mt-10">
                <Link
                  href="/histoire"
                  className="text-stone-700 hover:text-black transition-colors inline-flex items-center gap-3 font-light"
                >
                  Continuer la lecture
                  <span>→</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5]"
            >
              <Image
                src={homeImage("intro.jpg")}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
              Les collections
            </p>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight">
              Evenements,
              <br />
              Habitudes et longues routes.
            </h2>
          </motion.div>

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
                  className="group block relative overflow-hidden rounded-2xl aspect-square"
                >
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white text-xl font-light tracking-wide">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEW PRODUCTS ================= */}
      <section id="new-products" data-section className="pb-24 md:pb-36">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible["new-products"] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
              Nouveaux sacs
            </p>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight max-w-2xl">
              Sortis récemment de l’atelier.
            </h2>
          </motion.div>

          {newProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["new-products"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-10 font-light">
              Les prochains modèles arrivent bientôt.
            </p>
          )}
        </div>
      </section>

      {/* ================= FULL IMAGE ================= */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src={homeImage("silence.jpg")}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <blockquote className="text-white text-3xl md:text-5xl font-light leading-relaxed max-w-4xl">
            “Il existe des objets qu’on utilise.
            <br />
            Et d’autres qu’on garde près de soi.”
          </blockquote>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section id="values" data-section className="py-24 md:py-36 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
              Ce qui nous guide
            </p>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight">
              Fabriquer moins.
              <br />
              Fabriquer mieux.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-14 md:gap-16">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-square mb-8">
                  <Image
                    src={value.img}
                    alt=""
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <h3 className="text-2xl font-light mb-4 tracking-wide">
                  {value.title}
                </h3>

                <p className="text-stone-500 leading-relaxed font-light text-base max-w-sm mx-auto">
                  {value.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BEST SELLERS ================= */}
      <section id="best-sellers" data-section className="py-24 md:py-36 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible["best-sellers"] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
              Les plus portés
            </p>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight max-w-2xl">
              Ceux qui accompagnent déjà des centaines de routes.
            </h2>
          </motion.div>

          {bestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["best-sellers"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-10 font-light">
              Les essentiels arrivent bientôt.
            </p>
          )}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 md:py-36 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-12"
          >
            Ce qu’ils ressentent
          </motion.p>

          <div className="grid md:grid-cols-2 gap-10">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-left bg-stone-50 rounded-3xl p-10"
              >
                <p className="text-xl md:text-2xl font-light italic leading-relaxed text-stone-700 mb-6">
                  “{t.quote}”
                </p>

                <footer className="text-stone-400 text-sm font-light">
                  {t.author}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL ================= */}
<section className="relative py-28 md:py-40 overflow-hidden">
  <Image
    src={homeImage("hommage.jpg")}
    alt=""
    fill
    className="object-cover"
    sizes="100vw"
  />
  <div className="absolute inset-0 bg-stone-900/70" />

  <div className="relative z-10 text-white text-center">
    <div className="max-w-3xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-6">
          Nomade
        </p>

        <h2 className="text-4xl md:text-6xl font-light mb-8 leading-tight tracking-wide">
          Pour celles et ceux
          <br />
          qui avancent encore.
        </h2>

        <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light mb-12 max-w-2xl mx-auto">
          Vous n&apos;avez peut-être pas besoin de plus.
          <br />
          Peut-être simplement de quelque chose qui reste.
        </p>

        <Link
          href="/boutique"
          className="inline-block bg-white text-stone-900 px-10 py-4 rounded-full text-sm tracking-wider font-light hover:bg-stone-100 transition-colors"
        >
          Entrer dans la boutique
        </Link>
      </motion.div>
    </div>
  </div>
</section>
    </div>
  );
}

export default HomeClient;