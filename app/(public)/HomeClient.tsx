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

const homeVideo = (filename: string) =>
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
    { name: "Cuir", slug: "Cuir", img: homeImage("cat-cuir.webp") },
    { name: "Minimal", slug: "Minimal", img: homeImage("cat-minimal.webp") },
    { name: "Bandoulière", slug: "Bandouliere", img: homeImage("cat-bandouliere.webp") },
    { name: "Route", slug: "Aventure", img: homeImage("cat-aventure.webp") },
  ];

  const values = [
    {
      title: "Fabriqué à la main, chez nous",
      text: "Chaque pièce est coupée, cousue et finie dans notre atelier. Pas d'usine, pas de chaîne. Juste le temps qu'il faut pour que ce soit parfait.",
      img: homeImage("valeur-artisanat.webp"),
    },
    {
      title: "Conçu pour durer des années",
      text: "Cuir pleine fleur, toile épaisse, coutures solides. Nos sacs ne suivent pas les modes. Ils traversent le temps avec vous.",
      img: homeImage("valeur-durer.webp"),
    },
    {
      title: "L'essentiel, sans superflu",
      text: "Pas de logo criard. Pas de détail inutile. Un sac qui fait ce qu'on lui demande : porter vos affaires, bien, longtemps.",
      img: homeImage("valeur-essentiel.webp"),
    },
  ];

  const testimonials = [
    {
      quote: "Je l'ai depuis un an. Il est encore plus beau qu'au premier jour. Le cuir s'est patiné exactement comme je l'espérais.",
      author: "— Claire, Lyon",
    },
    {
      quote: "J'ai offert le même à ma sœur. On ne se quitte plus, ni le sac ni elle. C'est devenu notre objet.",
      author: "— Mehdi, Bruxelles",
    },
  ];

  return (
    <div className="bg-stone-50 text-stone-900 overflow-hidden">
  {/* ================= HERO ================= */}
<section className="relative min-h-dvh overflow-hidden">
  {/* Image de fond (visible en premier) */}
  <motion.div style={{ y: heroY }} className="absolute inset-0">
    <Image
      src={homeImage("hero.webp")}
      alt=""
      fill
      priority
      sizes="100vw"
      className="object-cover"
    />
  </motion.div>

  {/* Vidéo (invisible au début, apparaît après 3 secondes) */}
  <motion.div
    style={{ y: heroY }}
    className="absolute inset-0 opacity-0 transition-opacity duration-1000"
    id="hero-video-wrapper"
  >
    <video
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  onCanPlay={() => {
    setTimeout(() => {
      const wrapper = document.getElementById("hero-video-wrapper");
      if (wrapper) wrapper.classList.add("opacity-100");
    }, 2000);
  }}
  // Fallback : si onCanPlay n'est pas déclenché, afficher après 5s max
  onLoadedMetadata={() => {
    setTimeout(() => {
      const wrapper = document.getElementById("hero-video-wrapper");
      if (wrapper && !wrapper.classList.contains("opacity-100")) {
        wrapper.classList.add("opacity-100");
      }
    }, 5000);
  }}
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src={homeVideo("hero.webm")} type="video/webm" />
  <source src={homeVideo("hero.mp4")} type="video/mp4" />
</video>
  </motion.div>

  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

  {/* Contenu texte + boutons */}
  <div className="relative min-h-dvh flex flex-col justify-center px-6 md:px-10 pt-20 md:pt-24">
    <div className="max-w-5xl w-full mx-auto text-center">
      {/* Tag */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-white/40 text-xs sm:text-sm md:text-base tracking-[0.35em] uppercase mb-5 sm:mb-7 font-light"
      >
        Fabriqué en France &nbsp;·&nbsp; Cuir &nbsp;·&nbsp; Toile
      </motion.p>

      {/* Titre */}
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.85] tracking-[-0.02em] font-light text-white mb-6 sm:mb-8"
      >
        Nomade
      </motion.h1>

      {/* Sous‑titre */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight tracking-[-0.01em] font-extralight mb-3 max-w-3xl mx-auto"
      >
        Le sac qui vous suivra partout, pendant des années.
      </motion.p>

      {/* Sous‑texte secondaire */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-white/60 text-base sm:text-lg md:text-xl leading-relaxed font-extralight mb-8 max-w-lg mx-auto italic"
      >
        Fabrication artisanale, livraison offerte dès 100&nbsp;€.
      </motion.p>

      {/* Ligne décorative */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "4rem" }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="h-px bg-white/20 mx-auto mb-8"
      />

      {/* Boutons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link
          href="/boutique"
          className="bg-white text-stone-900 px-8 py-4 sm:px-10 sm:py-5 rounded-full text-xs sm:text-sm tracking-[0.15em] font-light hover:bg-stone-100 transition-all"
        >
          Voir la collection
        </Link>

        <Link
          href="/boutique?filter=nouveautes"
          className="border border-white/20 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full text-xs sm:text-sm tracking-[0.15em] font-light hover:bg-white/10 transition-all"
        >
          Nouveautés
        </Link>
      </motion.div>
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
                La différence Nomade
              </p>

              <h2 className="text-3xl md:text-5xl font-light mb-8 leading-tight tracking-wide">
                Un sac qui ne ressemble qu'à vous.
              </h2>

              <div className="space-y-5 text-stone-500 text-lg leading-relaxed font-light">
                <p>
                  Pas de production en série. Chaque sac est fabriqué un par un, 
                  dans notre atelier. avec des matériaux choisis pour leur qualité et leur durabilité.
                </p>
                <p>
                  Cuir pleine fleur, toile épaisse, coutures doubles. Des matériaux 
                  qui vieillissent bien. Très bien.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Link
                  href="/boutique"
                  className="bg-stone-900 text-white px-8 py-4 rounded-full text-sm tracking-wider font-light hover:bg-stone-800 transition-all"
                >
                  Je découvre
                </Link>
                <Link
                  href="/histoire"
                  className="border border-stone-300 text-stone-700 px-8 py-4 rounded-full text-sm tracking-wider font-light hover:border-stone-900 hover:text-stone-900 transition-all"
                >
                  Notre histoire
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
                src={homeImage("intro.webp")}
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
              Trouvez le vôtre
            </p>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight">
              quatre collections,
              <br />
              un même savoir-faire.
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
                    sizes="(max-width: 768px) 50vw, 20vw"
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
            <div className="text-center mb-14">
              <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
                Nouveautés
              </p>

              <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight max-w-2xl mx-auto">
                Ce qui vient de sortir de l'atelier.
              </h2>
            </div>
          </motion.div>

          {newProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6">
              {newProducts.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["new-products"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-[280px]"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-stone-400 font-light mb-4">Les prochains modèles arrivent.</p>
              <Link href="/boutique" className="text-stone-600 underline underline-offset-4 hover:text-stone-900 transition-colors text-sm font-light">
                Voir toute la collection
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= FULL IMAGE ================= */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src={homeImage("silence.webp")}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div>
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-6">
              Avis clients
            </p>
            <blockquote className="text-white text-3xl md:text-5xl font-light leading-relaxed max-w-4xl mb-8">
              "J'ai attendu un an avant de laisser un avis. Je voulais voir comment le sac allait vieillir. Il est encore plus beau."
            </blockquote>
            <p className="text-white/50 text-sm font-light">
              — Marie, cliente depuis 2025
            </p>
          </div>
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
              Pourquoi choisir Nomade
            </p>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight">
              La qualité que vous méritez,
              <br />
              au prix juste.
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
            className="mb-14 text-center"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4">
              Nos clients les recommandent
            </p>

            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight max-w-2xl mx-auto">
              Les modèles qui reviennent le plus souvent.
            </h2>
          </motion.div>

          {bestProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6">
              {bestProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["best-sellers"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] max-w-[280px]"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-stone-400 font-light mb-4">Les premiers avis arrivent bientôt.</p>
              <Link href="/boutique" className="text-stone-600 underline underline-offset-4 hover:text-stone-900 transition-colors text-sm font-light">
                Voir tous les sacs
              </Link>
            </div>
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
            Ce que nos clients disent
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
                  "{t.quote}"
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
          src={homeImage("hommage.webp")}
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
                Prêt à trouver le vôtre ?
              </p>

              <h2 className="text-4xl md:text-6xl font-light mb-8 leading-tight tracking-wide">
                Un sac fait main,
                <br />
                livré chez vous.
              </h2>

              <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light mb-12 max-w-2xl mx-auto">
                Livraison offerte dès 100 €. Retours gratuits sous 30 jours.
              </p>

              <Link
                href="/boutique"
                className="inline-block bg-white text-stone-900 px-10 py-4 rounded-full text-sm tracking-wider font-light hover:bg-stone-100 transition-colors"
              >
                Voir la collection
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeClient;