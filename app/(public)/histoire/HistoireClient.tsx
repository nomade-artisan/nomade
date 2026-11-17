"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

const histoireImage = (filename: string) =>
  supabase.storage.from("histoire").getPublicUrl(filename).data.publicUrl;

function HistoireClient() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#f8f5f1] text-stone-900 overflow-hidden"
    >
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-[78svh] overflow-hidden sm:min-h-screen">
        <div className="absolute inset-0">
          <Image
            src={histoireImage("histoire-hero.webp")}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 flex min-h-[78svh] items-end sm:min-h-screen">
          <div className="site-container max-w-7xl pb-16 sm:pb-20 md:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-4xl"
            >
              <p className="text-white/50 uppercase tracking-[0.4em] text-[11px] md:text-xs mb-7">
                Notre histoire
              </p>

              <h1 className="public-page-title mb-6 text-white sm:mb-8">
                NOMADE,
                <br />
                à Alès.
              </h1>

              <p className="max-w-2xl text-base font-light leading-relaxed text-white/75 sm:text-lg">
                La Maison se lance avec SCOLTA, sa marque de maroquinerie.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}
      <section className="bg-white py-16 md:py-28">
        <div className="site-container max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
                Le projet
              </p>

              <h2 className="public-section-title">
                Une envie
                <br />
                personnelle.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="space-y-6 text-base font-light leading-relaxed text-stone-600 sm:space-y-8 sm:text-lg"
            >
              <p>
                Nous avons créé NOMADE pour entreprendre, gagner en autonomie
                et construire une activité qui laisse une vraie place à notre
                famille.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SCOLTA
      ========================================================= */}
      <section className="bg-[#f8f5f1] py-16 md:py-28">
        <div className="site-container max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="order-2 lg:order-1"
            >
              <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
                Le nom SCOLTA
              </p>

              <h2 className="public-section-title">
                Un sac qui garde
                <br />
                ce qu'on lui confie.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="order-1 space-y-6 text-base font-light leading-relaxed text-stone-600 sm:space-y-8 sm:text-lg lg:order-2"
            >
              <p>
                Nous avons choisi SCOLTA parce que le nom est peu courant et
                porte une part de notre histoire. Il évoque pour nous une
                sentinelle.
              </p>

              <p>
                Nous commençons avec quelques modèles et ferons évoluer la suite
                avec l'expérience acquise.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          IMAGE ATELIER
      ========================================================= */}
      <section className="relative h-[55vh] min-h-[22rem] overflow-hidden sm:h-[65vh]">
        <Image
          src={histoireImage("histoire-atelier.webp")}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center text-white"
          >
            <p className="text-2xl font-extralight leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              « À Alès, de la coupe
              <br />
              à l'assemblage. »
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-sm font-light text-white/80 sm:text-base">
              Une même personne conçoit et réalise chaque modèle.
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* =========================================================
          MATIÈRES
      ========================================================= */}
      <section className="py-16 md:py-28">
        <div className="site-container max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
                Nos choix
              </p>

              <h2 className="public-section-title">
                Des matières
                <br />
                résistantes.
                <br />
                Des formes
                <br />
                simples.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="space-y-6 text-base font-light leading-relaxed text-stone-600 sm:space-y-8 sm:text-lg"
            >
              <p>
                Nous choisissons les matières pour leur résistance à l'usage.
                Le cuir, la toile et les composants varient selon les modèles ;
                chaque fiche produit en précise la composition.
              </p>

              <p>
                Nous aimons les formes simples. Un sac n'a pas besoin d'être
                compliqué ou futuriste pour faire son travail.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONCLUSION
      ========================================================= */}
      <section className="py-16 md:py-28">
        <div className="site-container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
              SCOLTA
            </p>

            <h2 className="public-section-title mb-7 sm:mb-9">
              Découvrez les modèles.
            </h2>

            <Link
              href="/boutique"
              className="inline-flex items-center justify-center bg-stone-950 text-white px-10 md:px-14 py-5 rounded-full uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-all duration-300"
            >
              Voir la boutique
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}

export default HistoireClient;
