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
      <section className="relative min-h-screen overflow-hidden">
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

        <div className="relative z-10 min-h-screen flex items-end">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full pb-24 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-4xl"
            >
              <p className="text-white/50 uppercase tracking-[0.4em] text-[11px] md:text-xs mb-7">
                Maison NOMADE
              </p>

              <h1 className="text-white text-5xl md:text-7xl xl:text-8xl font-extralight leading-[0.95] tracking-[-0.04em] mb-10">
                Une maison.
                <br />
                Des marques.
              </h1>

              <p className="text-white/70 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
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
      <section className="py-24 md:py-40 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
                La Maison NOMADE
              </p>

              <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
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
              className="space-y-8 text-stone-600 text-lg md:text-xl font-light leading-relaxed"
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
      <section className="py-24 md:py-40 bg-[#f8f5f1]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
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

              <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
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
              className="order-1 lg:order-2 space-y-8 text-stone-600 text-lg md:text-xl font-light leading-relaxed"
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
      <section className="relative h-[75vh] overflow-hidden">
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
            <p className="text-3xl md:text-6xl xl:text-7xl font-extralight leading-[1.1] tracking-[-0.03em]">
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
      <section className="py-24 md:py-40">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-20">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
                Les matières
              </p>

              <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
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
              className="space-y-8 text-stone-600 text-lg md:text-xl font-light leading-relaxed"
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
      <section className="py-24 md:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
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

            <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
              Faire les choses
              <br />
              avec attention.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
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
                className="bg-[#f8f5f1] rounded-[2rem] p-10 md:p-12 border border-stone-200/70 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className="text-stone-300 text-5xl font-extralight mb-10">
                  0{index + 1}
                </div>

                <h3 className="text-3xl font-extralight mb-6 tracking-[-0.03em]">
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
      <section className="py-32 md:py-44 bg-stone-950 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
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

            <blockquote className="text-4xl md:text-7xl font-extralight italic leading-[1.15] tracking-[-0.04em] text-white/90">
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
      <section className="py-24 md:py-40">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
              Le début
            </p>

            <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em] mb-10">
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