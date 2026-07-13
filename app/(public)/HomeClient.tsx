"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase/client";
import type { Collection } from "@/lib/collections/types";

// --- Types ---
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

interface HomeCategoryCard {
  name: string;
  slug: string;
  img: string;
}

// --- Helpers ---
const homeAsset = (filename: string, useNestedPath = true) =>
  supabase.storage
    .from("home")
    .getPublicUrl(useNestedPath ? `home/${filename}` : filename).data.publicUrl;

const homeImage = (filename: string) => homeAsset(filename, true);

const categoryImageMap: Record<string, string> = {
  cuir: "cat-cuir.webp",
  minimal: "cat-minimal.webp",
  bandouliere: "cat-bandouliere.webp",
  aventure: "cat-aventure.webp",
  route: "cat-aventure.webp",
  accessoires: "cat-minimal.webp",
};

function normalizeCategory(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function buildHomeCategoryCards(collections: Collection[]): HomeCategoryCard[] {
  return collections
    .map((collection) => {
      const normalizedSlug = normalizeCategory(collection.slug || collection.name);
      const imageFile = categoryImageMap[normalizedSlug] || "cat-minimal.webp";
      return {
        name: collection.name,
        slug: collection.slug,
        img: homeImage(imageFile),
      };
    })
    .slice(0, 4);
}

// --- Composant principal ---
export default function HomeClient({ collections }: { collections: Collection[] }) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoPathMode, setVideoPathMode] = useState<"nested" | "root">("nested");
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  const videoSources = useMemo(() => {
    const useNestedPath = videoPathMode === "nested";
    return {
      webm: homeAsset("hero.webm", useNestedPath),
      mp4: homeAsset("hero.mp4", useNestedPath),
    };
  }, [videoPathMode]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, [videoPathMode]);

  const handleHeroVideoError = () => {
    if (videoPathMode === "nested") {
      setVideoPathMode("root");
      return;
    }
    setVideoUnavailable(true);
  };

  useEffect(() => {
    fetch("/api/products?pageSize=50&status=active")
      .then((res) => res.json())
      .then((result) => {
        const products = result.data || result;
        const formatted = products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
          images: p.cover_image ? [p.cover_image] : [],
          category: p.category_name || "",
          isNew: p.is_new || false,
          rating: 0,
          reviews: 0,
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
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
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
  const categoryCards = useMemo(() => buildHomeCategoryCards(collections), [collections]);

  const values = [
    {
      title: "Fabriqué à la main, chez nous",
      text: "Chaque pièce est coupée, cousue et finie dans notre atelier. Juste le temps qu'il faut pour que ce soit parfait.",
      img: homeImage("valeur-artisanat.webp"),
    },
    {
      title: "Conçu pour durer des années",
      text: "Cuir pleine fleur, toile épaisse, coutures solides. Nos sacs ne suivent pas les modes. Ils traversent le temps avec vous.",
      img: homeImage("valeur-durer.webp"),
    },
    {
      title: "L'essentiel, sans superflu",
      text: "Un sac qui fait ce qu'on lui demande : porter vos affaires, bien, longtemps.",
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

  // --- Rendu ---
  return (
    <div className="bg-white text-stone-800 overflow-hidden font-light">
      {/* ====== HERO ====== */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Overlay vidéo */}
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
        <motion.div
          style={{ y: heroY }}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isVideoReady && !videoUnavailable ? "opacity-100" : "opacity-0"
          }`}
        >
          <video
            key={videoPathMode}
            ref={heroVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={homeImage("hero.webp")}
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
            onError={handleHeroVideoError}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSources.webm} type="video/webm" />
            <source src={videoSources.mp4} type="video/mp4" />
          </video>
        </motion.div>

        {/* Dégradé élégant */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <p className="text-white/50 text-xs tracking-[0.35em] uppercase mb-6 font-light">
              Fabriqué en France · Cuir · Toile
            </p>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight tracking-[-0.02em] text-white leading-[0.85] mb-6">
              Nomade
            </h1>
            <p className="text-white/90 text-2xl sm:text-3xl md:text-4xl font-light tracking-wide max-w-2xl mx-auto mb-4">
              Le sac qui vous suivra partout, pendant des années
            </p>
            <p className="text-white/50 text-base sm:text-lg font-light max-w-md mx-auto mb-10">
              Fabrication artisanale, livraison offerte dès 100 €
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/boutique"
                className="bg-white/90 backdrop-blur-sm text-stone-900 px-10 py-4 rounded-full text-sm tracking-[0.2em] font-light hover:bg-white transition-all"
              >
                Découvrir
              </Link>
              <Link
                href="/boutique?filter=nouveautes"
                className="border border-white/30 text-white px-10 py-4 rounded-full text-sm tracking-[0.2em] font-light hover:bg-white/10 transition-all"
              >
                Nouveautés
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== INTRO ====== */}
      <section className="py-24 md:py-36 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-6 font-light">
                La différence
              </p>
              <h2 className="text-3xl md:text-5xl font-light leading-tight tracking-wide mb-8">
                Un sac qui ne ressemble qu'à vous
              </h2>
              <div className="space-y-5 text-stone-500 text-lg leading-relaxed font-light">
                <p>
                  Pas de production en série. Chaque sac est fabriqué un par un,
                  dans notre atelier, avec des matériaux choisis pour leur qualité et leur durabilité.
                </p>
                <p>
                  Cuir pleine fleur, toile épaisse, coutures doubles. Des matériaux
                  qui vieillissent bien. Très bien.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
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
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== COLLECTIONS ====== */}
      <section className="py-24 md:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
              Trouvez le vôtre
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight">
              quatre collections,
              <br />
              un même savoir-faire
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            {categoryCards.map((cat, index) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-[calc(50%-12px)] max-w-[220px] md:w-[calc(25%-18px)] md:max-w-[260px]"
              >
                <Link
                  href={`/boutique?collection=${cat.slug}`}
                  className="group block relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-xl transition-shadow duration-500"
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

      {/* ====== NOUVEAUTÉS ====== */}
      <section id="new-products" data-section className="py-24 md:py-36 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible["new-products"] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
              Nouveautés
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight max-w-2xl mx-auto">
              Ce qui vient de sortir de l'atelier
            </h2>
          </motion.div>

          {newProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {newProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["new-products"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(25%-24px)] max-w-[280px]"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-stone-400 font-light mb-4">Les prochains modèles arrivent.</p>
              <Link
                href="/boutique"
                className="text-stone-600 underline underline-offset-4 hover:text-stone-900 transition-colors text-sm font-light"
              >
                Voir toute la collection
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ====== BANDEAU AVIS ====== */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image
          src={homeImage("silence.webp")}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div>
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-6 font-light">
              Avis clients
            </p>
            <blockquote className="text-white text-2xl md:text-4xl font-light leading-relaxed max-w-4xl mb-8">
              "J'ai attendu un an avant de laisser un avis. Je voulais voir comment le sac allait vieillir. Il est encore plus beau."
            </blockquote>
            <p className="text-white/50 text-sm font-light">— Marie, cliente depuis 2025</p>
          </div>
        </div>
      </section>

      {/* ====== VALEURS ====== */}
      <section id="values" data-section className="py-24 md:py-36 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
              Pourquoi choisir Nomade
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight">
              La qualité que vous méritez,
              <br />
              au prix juste
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
                <div className="relative rounded-2xl overflow-hidden aspect-square mb-8 shadow-sm hover:shadow-lg transition-shadow">
                  <Image
                    src={value.img}
                    alt=""
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-2xl font-light mb-4 tracking-wide">{value.title}</h3>
                <p className="text-stone-500 leading-relaxed font-light text-base max-w-sm mx-auto">
                  {value.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== MEILLEURES VENTES ====== */}
      <section id="best-sellers" data-section className="py-24 md:py-36 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible["best-sellers"] ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
              Nos clients les recommandent
            </p>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide leading-tight max-w-2xl mx-auto">
              Les modèles qui reviennent le plus souvent
            </h2>
          </motion.div>

          {bestProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {bestProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible["best-sellers"] ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(25%-24px)] max-w-[280px]"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-stone-400 font-light mb-4">Les premiers avis arrivent bientôt.</p>
              <Link
                href="/boutique"
                className="text-stone-600 underline underline-offset-4 hover:text-stone-900 transition-colors text-sm font-light"
              >
                Voir tous les sacs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ====== TÉMOIGNAGES ====== */}
      <section className="py-24 md:py-36 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-12 font-light">
            Ce que nos clients disent
          </p>
          <div className="grid md:grid-cols-2 gap-10">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-left bg-stone-50 rounded-3xl p-10 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xl md:text-2xl font-light italic leading-relaxed text-stone-700 mb-6">
                  "{t.quote}"
                </p>
                <footer className="text-stone-400 text-sm font-light">{t.author}</footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ====== APPEL FINAL ====== */}
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
              <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-6 font-light">
                Prêt à trouver le vôtre ?
              </p>
              <h2 className="text-4xl md:text-6xl font-light mb-8 leading-tight tracking-wide">
                Un sac fait main,
                <br />
                livré chez vous
              </h2>
              <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light mb-12 max-w-2xl mx-auto">
                Livraison offerte dès 100 €. Retours gratuits sous 30 jours
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