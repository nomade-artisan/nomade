"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductRoute } from "@/lib/products/routing";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase/client";
import type { Collection } from "@/lib/collections/types";

// --- Types ---
interface Product {
  id: number | string;
  slug?: string | number;
  name: string;
  price: number;
  images: string[];
  category: string;
  collectionSlug?: string | null;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
}

interface HomeCategoryCard {
  id: number;
  name: string;
  slug: string;
  img: string;
  description: string;
  productCount: number;
  video?: string;
}

interface HomeCollectionProduct {
  id: number | string;
  slug?: string | number;
  name: string;
  price: number;
  image: string;
}

// --- Helpers ---
const homeAsset = (filename: string, useNestedPath = true) =>
  supabase.storage
    .from("home")
    .getPublicUrl(useNestedPath ? `home/${filename}` : filename).data.publicUrl;

const homeImage = (filename: string) => homeAsset(filename, true);

const DEFAULT_COLLECTION_DESCRIPTION =
  "Des pièces pensées pour être portées au quotidien, avec des matières choisies et une attention particulière aux finitions.";

function normalizeCollectionDescription(description: string | null): string {
  const value = (description || "").replace(/\s+/g, " ").trim();
  return value.length > 0 ? value : DEFAULT_COLLECTION_DESCRIPTION;
}

function compactCopy(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}...`;
}

function CollectionProductShowcase({
  products,
}: {
  products: HomeCollectionProduct[];
}) {
  if (products.length === 0) return null;

  const showcaseItems = products.slice(0, 8);
  const count = showcaseItems.length;

  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-2"
        : count === 3
          ? "grid-cols-3"
          : count === 4
            ? "grid-cols-2"
            : count === 5 || count === 6
              ? "grid-cols-3"
              : "grid-cols-4";

  const wrapperWidthClass =
    count === 1
      ? "max-w-44"
      : count === 2
        ? "max-w-96"
        : count === 3
          ? "max-w-3xl"
          : count === 4
            ? "max-w-sm"
            : count === 5 || count === 6
              ? "max-w-3xl"
              : "max-w-4xl";

  const thumbSizes =
    count === 1
      ? "(max-width: 1024px) 100vw, 50vw"
      : count === 2
        ? "(max-width: 1024px) 50vw, 25vw"
        : count === 3 || count === 5 || count === 6
          ? "(max-width: 1024px) 33vw, 16vw"
          : count === 4
            ? "(max-width: 1024px) 50vw, 25vw"
            : "(max-width: 768px) 25vw, 12.5vw";

  return (
    <div className="mt-6 mx-auto w-full max-w-[620px]">
      <div
        className={`mx-auto grid ${gridClass} ${wrapperWidthClass} gap-1.5 md:gap-2`}
      >
        {showcaseItems.map((product) => (
          <Link
            key={product.id}
            href={getProductRoute(product)}
            className="group/showcase block w-full"
            aria-label={product.name}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 rounded-[1.1rem]">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes={thumbSizes}
                  className="object-cover transition-transform duration-500 group-hover/showcase:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-400 text-sm uppercase tracking-[0.15em]">
                  N
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// --- CollectionCard ---
function CollectionCard({
  cat,
  index,
  products,
}: {
  cat: HomeCategoryCard;
  index: number;
  products: HomeCollectionProduct[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`
        group relative grid grid-cols-1 items-center gap-4 py-6 sm:gap-6 sm:py-8 lg:grid-cols-2 lg:gap-12 lg:py-10
        ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}
      `}
    >
      {/* IMAGE / VIDEO */}
      <Link
        href={`/boutique/collection/${cat.slug}`}
        className="block w-full overflow-hidden"
      >
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[600px] overflow-hidden rounded-2xl bg-stone-100 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)] sm:rounded-3xl">
          {cat.video ? (
            <video
              src={cat.video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={cat.img}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={cat.img}
              alt={cat.name}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 720px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}

          {/* Mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent lg:hidden flex flex-col justify-end p-6 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 mb-2">
              Collection
            </p>

            <h3 className="text-xl font-light leading-tight tracking-wide sm:text-2xl">
              {cat.name}
            </h3>
          </div>
        </div>
      </Link>

      {/* DESKTOP TEXT */}
      <div className="hidden mx-auto w-full max-w-[28rem] px-4 text-center lg:block lg:px-0 lg:text-left">
        <p className="mb-3 uppercase tracking-[0.35em] text-[10px] text-stone-400">
          Collection
        </p>

        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light leading-tight tracking-wide text-stone-900">
          {cat.name}
        </h3>

        <p className="mt-4 text-[14px] md:text-[15px] leading-7 text-stone-500 font-light">
          {compactCopy(cat.description, 110)}
        </p>

        <CollectionProductShowcase products={products} />

        <Link
          href={`/boutique/collection/${cat.slug}`}
          className="mt-7 inline-flex items-center gap-3 border-b border-stone-300 pb-1 text-[10px] uppercase tracking-[0.32em] text-stone-700 hover:text-stone-900 hover:border-stone-900 transition-all duration-300 group/link"
        >
          Découvrir
          <span className="transition-transform duration-300 group-hover/link:translate-x-1">
            
          </span>
        </Link>
      </div>

      {/* MOBILE TEXT */}
      <div className="lg:hidden px-4 mt-2 text-center">
        <p className="mt-3 text-sm leading-relaxed text-stone-500 font-light px-2">
          {compactCopy(cat.description, 90)}
        </p>

        <CollectionProductShowcase products={products} />

        <Link
          href={`/boutique/collection/${cat.slug}`}
          className="mt-5 inline-flex items-center gap-2 border-b border-stone-300 pb-1 text-xs uppercase tracking-[0.35em] text-stone-700"
        >
          Découvrir la collection
          <span></span>
        </Link>
      </div>
    </motion.section>
  );
}

function buildHomeCategoryCards(
  collections: Collection[],
  productCountByCollection: Record<string, number>
): HomeCategoryCard[] {
  return collections.slice(0, 4).map((collection) => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    img: collection.image_path
      ? supabase.storage
          .from("collections")
          .getPublicUrl(collection.image_path).data.publicUrl
      : homeImage("cat-minimal.webp"),
    video: collection.video_path
      ? supabase.storage
          .from("collections")
          .getPublicUrl(collection.video_path).data.publicUrl
      : undefined,
    description: normalizeCollectionDescription(collection.description),
    productCount: productCountByCollection[collection.slug] || 0,
  }));
}

// --- Composant principal ---
export default function HomeClient({
  collections,
  initialProducts,
}: {
  collections: Collection[];
  initialProducts: Product[];
}) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);

  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const products = initialProducts;

  const [shouldLoadHeroVideo, setShouldLoadHeroVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoPathMode, setVideoPathMode] =
    useState<"nested" | "root">("nested");
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const atelierVideoRef = useRef<HTMLVideoElement | null>(null);

  const [shouldPlayAtelierVideo, setShouldPlayAtelierVideo] = useState(false);

  const youtubeChannelUrl =
    process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL?.trim() || "";

  const videoSources = useMemo(() => {
    const useNestedPath = videoPathMode === "nested";

    return {
      webm: homeAsset("hero.webm", useNestedPath),
      mp4: homeAsset("hero.mp4", useNestedPath),
    };
  }, [videoPathMode]);

  useEffect(() => {
    if (videoUnavailable) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let heroVisible = false;

    const maybeEnableHeroVideo = () => {
      if (heroVisible) setShouldLoadHeroVideo(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        heroVisible = Boolean(entry?.isIntersecting);
        maybeEnableHeroVideo();
      },
      { threshold: 0.35 }
    );

    if (heroSectionRef.current) {
      observer.observe(heroSectionRef.current);
    }

    const handleInteraction = () => maybeEnableHeroVideo();
    const delayedStart = window.setTimeout(maybeEnableHeroVideo, 1200);

    window.addEventListener("pointerdown", handleInteraction, {
      passive: true,
    });
    window.addEventListener("scroll", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction);

    return () => {
      observer.disconnect();
      window.clearTimeout(delayedStart);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [videoUnavailable]);

  useEffect(() => {
    if (!shouldLoadHeroVideo) return;

    const video = heroVideoRef.current;
    if (!video) return;

    video.play().catch(() => {});
  }, [videoPathMode, shouldLoadHeroVideo]);

  const handleHeroVideoError = () => {
    if (videoPathMode === "nested") {
      setVideoPathMode("root");
      return;
    }

    setVideoUnavailable(true);
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setShouldPlayAtelierVideo(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.25 }
    );

    if (atelierVideoRef.current) {
      observer.observe(atelierVideoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = atelierVideoRef.current;
    if (!video) return;

    if (shouldPlayAtelierVideo) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlayAtelierVideo]);

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

  const bestProducts = products
    .filter((p) => (p.rating || 0) >= 4.7)
    .slice(0, 4);

  const productCountByCollection = useMemo(
    () =>
      products.reduce<Record<string, number>>((acc, product) => {
        if (!product.collectionSlug) return acc;

        acc[product.collectionSlug] =
          (acc[product.collectionSlug] || 0) + 1;

        return acc;
      }, {}),
    [products]
  );

  const categoryCards = useMemo(
    () => buildHomeCategoryCards(collections, productCountByCollection),
    [collections, productCountByCollection]
  );

  const productsByCollection = useMemo(
    () =>
      products.reduce<Record<string, HomeCollectionProduct[]>>(
        (acc, product) => {
          if (!product.collectionSlug) return acc;

          const current = acc[product.collectionSlug] || [];

          if (current.length >= 8) return acc;

          current.push({
            id: product.id,
            slug: product.slug || String(product.id),
            name: product.name,
            price: product.price,
            image: product.images[0] || "",
          });

          acc[product.collectionSlug] = current;

          return acc;
        },
        {}
      ),
    [products]
  );

  const values = [
    {
      title: "Fabriqué à la main",
      text: "Chaque pièce est fabriquée avec soin, de la coupe du cuir jusqu'aux dernières finitions.",
      img: homeImage("valeur-artisanat.webp"),
    },
    {
      title: "Des matières choisies avec soin",
      text: "Nous sélectionnons nos cuirs et nos toiles pour leur toucher, leur tenue et leur capacité à bien vieillir.",
      img: homeImage("valeur-durer.webp"),
    },
    {
      title: "Pensé pour être utilisé",
      text: "Une belle pièce doit aussi être pratique. Nous cherchons le bon équilibre entre forme, confort et fonctionnalité.",
      img: homeImage("valeur-essentiel.webp"),
    },
  ];

  return (
    <div className="bg-white text-stone-800 overflow-hidden font-light">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        ref={heroSectionRef}
        className="relative min-h-[74svh] overflow-hidden sm:min-h-[82svh] lg:min-h-[90vh]"
      >
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0"
        >
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
            shouldLoadHeroVideo &&
            isVideoReady &&
            !videoUnavailable
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          {shouldLoadHeroVideo && (
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
          )}
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="relative flex min-h-[74svh] flex-col items-center justify-center px-4 pb-10 pt-24 text-center sm:min-h-[82svh] sm:px-6 sm:pb-14 sm:pt-28 lg:min-h-[90vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-4xl"
          >
            <p className="mb-4 text-[10px] font-light uppercase tracking-[0.24em] text-white/60 sm:mb-6 sm:text-xs sm:tracking-[0.35em]">
              Fabriqué en France · Cuir · Toile
            </p>

            <div className="mb-7">
              <p className="mb-3 text-[10px] font-light uppercase tracking-[0.3em] text-white/65 sm:text-xs sm:tracking-[0.4em]">
                By Nomade
              </p>

              <h1 className="home-brand-title text-white">
                SCOLTA
              </h1>
            </div>

            <p className="mx-auto mb-3 max-w-2xl text-xl font-light tracking-wide text-white/90 sm:text-2xl md:text-3xl">
              Un sac pour partir.
            </p>

            <p className="mx-auto mb-7 max-w-md text-sm font-light text-white/70 sm:mb-10 sm:text-base">
              La première collection de SCOLTA.
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link
                href="/boutique"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/90 px-7 py-3 text-xs font-light tracking-[0.16em] text-stone-900 backdrop-blur-sm transition-all hover:bg-white sm:px-9 sm:py-3.5 sm:text-sm sm:tracking-[0.2em]"
              >
                Découvrir
              </Link>

              <Link
                href="/boutique?filter=nouveautes"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-7 py-3 text-xs font-light tracking-[0.16em] text-white transition-all hover:bg-white/10 sm:px-9 sm:py-3.5 sm:text-sm sm:tracking-[0.2em]"
              >
                Nouveautés
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}
      <section className="bg-stone-50 py-16 md:py-24">
        <div className="site-container max-w-6xl">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-6 font-light">
                Notre approche
              </p>

              <h2 className="public-section-title mb-6">
                Des pièces faites pour être portées au quotidien
              </h2>

              <p className="max-w-xl text-base font-light leading-relaxed text-stone-500 sm:text-lg">
                Nous travaillons des formes simples, des matières que nous
                aimons et des détails qui ont leur utilité.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-9 sm:justify-start sm:gap-4">
                <Link
                  href="/boutique"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-xs font-light tracking-wider text-white transition-all hover:bg-stone-800 sm:px-8 sm:text-sm"
                >
                  Découvrir SCOLTA
                </Link>

                <Link
                  href="/histoire"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-xs font-light tracking-wider text-stone-700 transition-all hover:border-stone-900 hover:text-stone-900 sm:px-8 sm:text-sm"
                >
                  La Maison NOMADE
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-lg"
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

      {/* =========================================================
          COLLECTIONS
      ========================================================= */}
      <section className="site-container max-w-7xl">

        <div className="mx-auto max-w-3xl py-12 text-center sm:py-16">
          <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
            Collections
          </p>

          <h2 className="public-section-title text-stone-900">
            Les collections
          </h2>

          <p className="mt-6 text-stone-500 text-base md:text-lg leading-relaxed font-light">
            Découvrez les premiers modèles de SCOLTA.
          </p>
        </div>

        {categoryCards.map((cat, index) => (
          <CollectionCard
            key={cat.slug}
            cat={cat}
            index={index}
            products={productsByCollection[cat.slug] || []}
          />
        ))}

        <div className="pb-12 pt-6 text-center sm:pb-16">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-3 px-7 py-3 text-xs uppercase tracking-[0.25em] text-stone-700 hover:text-stone-900 transition-colors"
          >
            Voir toutes les collections
            <span></span>
          </Link>
        </div>

      </section>

      {/* =========================================================
          NOUVEAUTÉS
      ========================================================= */}
      <section
        id="new-products"
        data-section
        className="bg-stone-50 py-16 md:py-24"
      >
        <div className="site-container max-w-7xl">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isVisible["new-products"]
                ? { opacity: 1, y: 0 }
                : {}
            }
            transition={{ duration: 0.6 }}
            className="mb-10 text-center sm:mb-12"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
              Nouveautés
            </p>

            <h2 className="public-section-title mx-auto max-w-2xl">
              Les nouveautés
            </h2>
          </motion.div>

          {newProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-8 sm:gap-x-8">
              {newProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isVisible["new-products"]
                      ? { opacity: 1, y: 0 }
                      : {}
                  }
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                  }}
                  className="w-[calc(50%-0.375rem)] max-w-[280px] sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
                >
                  <ProductCard
                    product={product}
                    showPrice={false}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-stone-400 font-light mb-4">
                Les prochains modèles arrivent.
              </p>

              <Link
                href="/boutique"
                className="text-stone-600 underline underline-offset-4 hover:text-stone-900 transition-colors text-sm font-light"
              >
                Voir la collection
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================
          ATELIER
      ========================================================= */}
      <section className="relative h-[58vh] min-h-96 overflow-hidden sm:h-[65vh] lg:h-[70vh]">

        <video
          ref={atelierVideoRef}
          autoPlay={shouldPlayAtelierVideo}
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          poster={homeImage("valeurs-video-poster.webp")}
        >
          <source
            src={homeAsset("valeurs.webm", false)}
            type="video/webm"
          />

          <source
            src={homeAsset("valeurs.mp4", false)}
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-white sm:px-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-6 font-light">
              L'atelier
            </p>

            <h2 className="public-section-title mb-5 text-white">
              Chaque détail compte
            </h2>

            <p className="mx-auto max-w-2xl text-base font-light text-white/80 sm:text-lg">
              Coupe, assemblage, couture, finition : chaque étape demande du
              temps et de l'attention.
            </p>

            {youtubeChannelUrl && (
              <a
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 border-b border-white/50 pb-1 text-xs uppercase tracking-[0.3em] text-white/90 hover:text-white hover:border-white transition-colors"
              >
                Chaîne YouTube
              </a>
            )}
          </motion.div>

        </div>
      </section>

      {/* =========================================================
          VALEURS
      ========================================================= */}
      <section
        id="values"
        data-section
        className="bg-white py-16 md:py-24"
      >
        <div className="site-container max-w-6xl">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center sm:mb-14"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
              Notre façon de faire
            </p>

            <h2 className="public-section-title">
              Ce qui compte pour nous
            </h2>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-12">

            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg sm:mb-8">
                  <Image
                    src={value.img}
                    alt=""
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <h3 className="mb-3 text-xl font-light tracking-wide sm:mb-4 sm:text-2xl">
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

      {/* =========================================================
          SÉLECTION
      ========================================================= */}
      <section
        id="best-sellers"
        data-section
        className="bg-stone-50 py-16 md:py-24"
      >
        <div className="site-container max-w-7xl">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isVisible["best-sellers"]
                ? { opacity: 1, y: 0 }
                : {}
            }
            transition={{ duration: 0.6 }}
            className="mb-10 text-center sm:mb-12"
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-4 font-light">
              La sélection SCOLTA
            </p>

            <h2 className="public-section-title mx-auto max-w-2xl">
              Les premiers modèles
            </h2>

            <p className="mt-5 text-stone-500 text-base font-light max-w-xl mx-auto">
              Une sélection des pièces disponibles au lancement.
            </p>
          </motion.div>

          {bestProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-8 sm:gap-x-8">
              {bestProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isVisible["best-sellers"]
                      ? { opacity: 1, y: 0 }
                      : {}
                  }
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                  }}
                  className="w-[calc(50%-0.375rem)] max-w-[280px] sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
                >
                  <ProductCard
                    product={product}
                    showPrice={false}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-stone-400 font-light mb-4">
                Les premiers modèles arrivent bientôt.
              </p>

              <Link
                href="/boutique"
                className="text-stone-600 underline underline-offset-4 hover:text-stone-900 transition-colors text-sm font-light"
              >
                Voir la collection
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* =========================================================
          FIN
      ========================================================= */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">

        <Image
          src={homeImage("hommage.webp")}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-stone-900/70" />

        <div className="relative z-10 text-white text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-6 font-light">
                Le début
              </p>

              <h2 className="public-page-title mb-6 text-white sm:mb-8">
                Découvrez
                <br />
                SCOLTA
              </h2>

              <p className="mx-auto mb-8 max-w-2xl text-base font-light leading-relaxed text-white/70 sm:mb-10 sm:text-lg">
                Les premiers modèles de la marque, développée par la Maison
                NOMADE.
              </p>

              <Link
                href="/boutique"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 py-3 text-xs font-light tracking-wider text-stone-900 transition-colors hover:bg-stone-100 sm:px-9 sm:py-3.5 sm:text-sm"
              >
                Découvrir SCOLTA
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}
