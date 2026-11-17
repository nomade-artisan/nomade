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
                Maison NOMADE
              </p>

              <h1 className="public-page-title mb-6 text-white sm:mb-8">
                Une maison.
                <br />
                Des marques.
              </h1>

              <p className="max-w-2xl text-base font-light leading-relaxed text-white/75 sm:text-lg">
                La Maison NOMADE développe des marques autour du cuir, de
                l'artisanat et des objets du quotidien. SCOLTA est l'une
                d'entre elles.
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
                La Maison NOMADE
              </p>

              <h2 className="public-section-title">
                Construire
                <br />
                une maison
                <br />
                qui avance
                <br />
                avec le temps.
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
                NOMADE est une maison qui développe des marques et des
                collections dans l'univers du cuir, de la maroquinerie et des
                accessoires.
              </p>

              <p>
                Notre volonté est de créer des produits que l'on peut
                réellement utiliser au quotidien. Nous accordons une attention
                particulière aux matières, aux proportions, à la construction
                et aux finitions.
              </p>

              <p>
                Nous sommes encore au début de cette aventure. La Maison
                NOMADE se construit progressivement, avec l'envie de développer
                plusieurs univers et de donner à chacun sa propre identité.
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
                Une marque de la Maison NOMADE
              </p>

              <h2 className="public-section-title">
                SCOLTA
                <br />
                commence ici.
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
                SCOLTA est une marque développée par la Maison NOMADE. Elle
                possède son propre univers, son identité et ses propres
                collections.
              </p>

              <p>
                La marque commence avec une première série de sacs et
                d'accessoires. Les modèles sont développés en petites séries,
                avec une attention portée à leur usage et à leur fabrication.
              </p>

              <p>
                SCOLTA est encore jeune. Nous préférons commencer avec peu de
                modèles, apprendre de chacun d'eux et faire évoluer la marque
                au fil du temps.
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
              « Chaque détail
              <br />
              compte. »
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
                Les matières
              </p>

              <h2 className="public-section-title">
                Choisir
                <br />
                ce qui
                <br />
                convient
                <br />
                à chaque pièce.
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
                Le cuir occupe une place importante dans l'univers de SCOLTA.
                Nous recherchons des matières avec une bonne tenue, un toucher
                agréable et une capacité à évoluer avec l'usage.
              </p>

              <p>
                Selon les modèles, nous travaillons également la toile et
                différents composants. Chaque choix répond à un besoin précis
                dans la construction et l'utilisation du produit.
              </p>

              <p>
                Au lancement, nous faisons le choix de rester concentrés sur
                quelques matières et quelques modèles. Cette approche nous
                permet de mieux connaître nos produits et d'améliorer chaque
                nouvelle série.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALEURS
      ========================================================= */}
      <section className="bg-white py-16 md:py-24">
        <div className="site-container max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
              Notre manière de travailler
            </p>

            <h2 className="public-section-title">
              Faire les choses
              <br />
              avec attention.
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {[
              {
                title: "Le temps",
                text: "Un modèle demande plusieurs essais. Nous testons les formes, les assemblages et les détails avant de le proposer.",
              },
              {
                title: "Les matières",
                text: "Cuir, toile et composants sont choisis en fonction du modèle, de leur qualité et de l'usage auquel ils sont destinés.",
              },
              {
                title: "La simplicité",
                text: "Nous privilégions des formes lisibles et fonctionnelles. Chaque élément doit avoir une utilité.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.8 }}
                className="rounded-[1.5rem] border border-stone-200/70 bg-[#f8f5f1] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[2rem] sm:p-8 lg:p-10"
              >
                <div className="mb-6 text-4xl font-extralight text-stone-300 sm:mb-8">
                  0{index + 1}
                </div>

                <h3 className="mb-4 text-2xl font-extralight tracking-[-0.03em] sm:mb-6 sm:text-3xl">
                  {item.title}
                </h3>

                <p className="text-stone-600 text-lg leading-relaxed font-light">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          VISION
      ========================================================= */}
      <section className="overflow-hidden bg-stone-950 py-20 text-white sm:py-24 md:py-32">
        <div className="site-container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <p className="text-white/30 uppercase tracking-[0.35em] text-[11px] mb-10">
              Notre vision
            </p>

            <blockquote className="public-section-title mx-auto max-w-4xl italic leading-[1.2] tracking-[-0.035em] text-white/90">
              « Faire des pièces
              <br />
              que l'on aura
              <br />
              envie de garder. »
            </blockquote>
          </motion.div>
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
              Le début
            </p>

            <h2 className="public-section-title mb-7 sm:mb-9">
              Nous commençons ici.
            </h2>

            <p className="text-stone-500 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-16">
              SCOLTA est l'une des premières marques développées par la Maison
              NOMADE. La suite se construira progressivement, avec de nouveaux
              modèles, de nouvelles collections et l'expérience acquise au fil
              du temps.
            </p>

            <Link
              href="/boutique"
              className="inline-flex items-center justify-center bg-stone-950 text-white px-10 md:px-14 py-5 rounded-full uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-all duration-300"
            >
              Découvrir SCOLTA
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}

export default HistoireClient;
