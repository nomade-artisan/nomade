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
  description: string;
  video?: string;
}

// --- Helpers ---
const homeAsset = (filename: string, useNestedPath = true) =>
  supabase.storage
    .from("home")
    .getPublicUrl(useNestedPath ? `home/${filename}` : filename).data.publicUrl;

const homeImage = (filename: string) => homeAsset(filename, true);

function CollectionCard({
  cat,
  index,
}: {
  cat: HomeCategoryCard;
  index: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    if (!cat.video) return;

    setIsHovering(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (!cat.video) return;

    setIsHovering(false);

    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <section
      className={`grid lg:grid-cols-[440px_360px] justify-center gap-20 xl:gap-28 items-center ${
        index % 2 === 1
          ? "lg:[&>*:first-child]:order-2"
          : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* IMAGE / VIDEO */}
      <div className="w-full max-w-[440px] mx-auto">
        <Link href={`/boutique?collection=${cat.slug}`}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={cat.img}
              alt={cat.name}
              fill
              sizes="(max-width:1024px) 100vw, 440px"
              className={`object-cover transition-all duration-700 ${
                isHovering && cat.video
                  ? "opacity-0 scale-105"
                  : "opacity-100 scale-100"
              }`}
            />

            {cat.video && (
              <video
                ref={videoRef}
                src={cat.video}
                muted
                loop
                playsInline
                preload="none"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  isHovering
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            )}
          </div>
        </Link>
      </div>

      {/* TEXTE */}
      <div
        className={`max-w-[360px] ${
          index % 2 === 0 ? "lg:pl-6" : "lg:pr-6"
        }`}
      >
        <p className="uppercase tracking-[0.35em] text-[11px] text-stone-400 mb-4">
          Collection
        </p>

        <h3 className="text-3xl md:text-5xl font-light leading-tight tracking-wide mb-8">
          {cat.name}
        </h3>

        <p className="text-stone-500 leading-8 text-base mb-8">
          {cat.description}
        </p>

        <Link
          href={`/boutique?collection=${cat.slug}`}
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] hover:gap-5 transition-all duration-300"
        >
          Découvrir
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}


function buildHomeCategoryCards(collections: Collection[]): HomeCategoryCard[] {
  return collections.slice(0, 4).map((collection) => ({
    name: collection.name,
    slug: collection.slug,
    img: collection.image_path
      ? supabase.storage.from('collections').getPublicUrl(collection.image_path).data.publicUrl
      : homeImage('cat-minimal.webp'), // fallback
    video: collection.video_path
      ? supabase.storage.from('collections').getPublicUrl(collection.video_path).data.publicUrl
      : undefined,
    description: collection.description || '',
  }));
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
    title: "Fabriqué à la main",
    text: "Chaque pièce est coupée, cousue et finie dans notre atelier. Le temps nécessaire est pris pour garantir des finitions soignées.",
    img: homeImage("valeur-artisanat.webp"),
  },
  {
    title: "Conçu pour durer",
    text: "Cuir pleine fleur, toile robuste et coutures renforcées. Des matériaux choisis pour accompagner votre quotidien pendant de nombreuses années.",
    img: homeImage("valeur-durer.webp"),
  },
  {
    title: "Pensé dans les moindres détails",
    text: "Chaque poche, chaque couture et chaque finition ont une raison d'être. Rien n'est laissé au hasard.",
    img: homeImage("valeur-essentiel.webp"),
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

{/* ====== COLLECTIONS – version épurée et aérée ====== */}
{categoryCards.map((cat, index) => (
  <div
    key={cat.slug}
   className="max-w-5xl xl:max-w-6xl mx-auto px-6 md:px-10 lg:px-16">
    <CollectionCard
      cat={cat}
      index={index}
    />
  </div>
))}

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

      
      {/* Juste avant ou après la section valeurs, insère ce bloc */}
      <section className="relative h-[70vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={homeImage("valeurs-video-poster.webp")}
        >
          <source src={homeAsset("valeurs.webm", false)} type="video/webm" />
          <source src={homeAsset("valeurs.mp4", false)} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-6 font-light">
              L’atelier
            </p>
            <h2 className="text-3xl md:text-5xl font-light mb-6 tracking-wide">
              Fabriqué avec attention
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto font-light">
              Chaque geste compte. Découvrez notre savoir-faire
            </p>
          </motion.div>
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