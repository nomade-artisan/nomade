// app/histoire/HistoireClient.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function HistoireClient() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-stone-50 text-stone-900 overflow-hidden"
    >

      {/* HERO */}

      <section className="relative h-[75vh] md:h-[92vh] overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex items-end">

          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full pb-20 md:pb-28">

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >

              <p className="text-white/40 uppercase tracking-[0.35em] text-xs mb-6">
                Notre histoire
              </p>

              <h1 className="text-white text-5xl md:text-7xl font-light leading-none tracking-wide mb-8">
                Certaines routes
                <br />
                obligent à
                <br />
                 changer de direction
              </h1>

              <p className="text-white/65 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Nomade est né d'une période où tout changeait.
              </p>

            </motion.div>

          </div>

        </div>

      </section>

      {/* INTRO */}

      <section className="py-24 md:py-36">

        <div className="max-w-3xl mx-auto px-6 md:px-10">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >

            <p className="text-stone-400 uppercase tracking-[0.3em] text-xs mb-8">
              Là où tout commence
            </p>

            <div className="space-y-8 text-stone-600 font-light leading-relaxed text-lg md:text-xl">

              <p>
                Il y a des périodes où les choses ne suivent plus
                le chemin prévu.
              </p>

              <p>
                Alors on avance autrement.
                Plus lentement.
                Plus discrètement.
              </p>

              <p>
                On apprend à vivre avec moins.
                À garder seulement ce qui compte.
              </p>

              <p>
                C’est dans ce moment-là que Nomade est apparu.
              </p>

            </div>

          </motion.div>

        </div>

      </section>

      {/* IMAGE */}

      <section className="relative h-[55vh] overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1533130061792-64b345e4a833"
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 flex items-center justify-center px-6">

          <blockquote className="text-white text-3xl md:text-5xl font-light text-center leading-tight max-w-4xl">
            Certains objets
            <br />
            restent longtemps
            <br />
            et marque l'esprit.
          </blockquote>

        </div>

      </section>

      {/* STORY */}

      <section className="py-24 md:py-36 bg-white">

        <div className="max-w-4xl mx-auto px-6 md:px-10">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >

            <p className="text-stone-400 uppercase tracking-[0.3em] text-xs mb-8">
              Pourquoi des sacs
            </p>

            <div className="space-y-8 text-stone-600 font-light leading-relaxed text-lg md:text-xl">

              <p>
                Parce qu’un sac accompagne ce qui bouge.
              </p>

              <p>
                Les départs
                Les nouvelles habitudes
                Les villes qu’on traverse
              </p>

              <p>
                Avec le temps,
                certains objets cessent d’être de simples objets.
              </p>

              <p>
                Ils deviennent des repères nostalgiques.
              </p>

            </div>

          </motion.div>

        </div>

      </section>

      {/* VALUES */}

      <section className="py-24 md:py-36">

        <div className="max-w-6xl mx-auto px-6 md:px-10">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >

            <div className="text-center mb-20">

              <p className="text-stone-400 uppercase tracking-[0.3em] text-xs mb-8">
                Ce qui reste
              </p>

              <h2 className="text-4xl md:text-5xl font-light leading-tight">
                Faire peu.
                <br />
                Garder longtemps.
              </h2>

            </div>

            <div className="grid md:grid-cols-3 gap-14 md:gap-16">

              <div>

                <h3 className="text-2xl font-light mb-5 tracking-wide">
                  Le temps
                </h3>

                <p className="text-stone-600 leading-relaxed font-light text-lg">
                  Certaines choses demandent du temps
                  pour trouver leur forme.
                </p>

              </div>

              <div>

                <h3 className="text-2xl font-light mb-5 tracking-wide">
                  La matière
                </h3>

                <p className="text-stone-600 leading-relaxed font-light text-lg">
                  Nous aimons les objets
                  qui portent les traces d’une vie.
                </p>

              </div>

              <div>

                <h3 className="text-2xl font-light mb-5 tracking-wide">
                  L’essentiel
                </h3>

                <p className="text-stone-600 leading-relaxed font-light text-lg">
                  Garder moins.
                  Mais garder mieux.
                </p>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* QUOTE */}

      <section className="py-28 md:py-40 bg-stone-900 text-white">

        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">

          <motion.blockquote
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light italic leading-relaxed text-white/85"
          >
            “Parfois,
            <br />
            perdre une direction
            <br />
            permet d’en trouver une autre.”
          </motion.blockquote>

        </div>

      </section>

      {/* END */}

      <section className="py-24 md:py-36">

        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >

            <p className="text-stone-400 uppercase tracking-[0.3em] text-xs mb-8">
              Aujourd’hui
            </p>

            <h2 className="text-4xl md:text-5xl font-light leading-tight mb-10">
              Continuer la route.
            </h2>

            <p className="text-stone-500 text-lg md:text-xl leading-relaxed font-light mb-14 max-w-2xl mx-auto">
              Nomade continue d’avancer doucement.
              <br />
              Avec la même idée depuis le début :
              créer des objets simples,
              durables,
              et utiles.
            </p>

            <Link
              href="/boutique"
              className="inline-flex items-center justify-center bg-stone-900 text-white px-10 py-4 rounded-full text-sm tracking-[0.18em] uppercase hover:bg-stone-800 transition-colors"
            >
              Découvrir la collection
            </Link>

          </motion.div>

        </div>

      </section>

    </motion.div>
  );
}

export default HistoireClient;