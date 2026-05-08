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
      className="bg-stone-50 min-h-screen"
    >
      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-light text-white tracking-wide"
          >
            Notre histoire
          </motion.h1>
        </div>
      </section>

      {/* Le début */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-6">
              Là où tout commence
            </p>
            <h2 className="text-3xl md:text-4xl font-light mb-8 tracking-wide leading-tight">
              Chaque sac a une histoire.
              <br />
              La nôtre commence sur la route.
            </h2>
            <div className="space-y-6 text-stone-600 font-light leading-relaxed text-base">
              <p>
                Nomade est né d&apos;un chemin. Celui qu&apos;on emprunte quand on
                quitte une terre pour une autre. Quand on apprend à vivre avec
                peu, mais avec tout ce qui compte.
              </p>
              <p>
                Il y a des voyages qu&apos;on ne choisit pas. Des départs qui
                s&apos;imposent. Des frontières qui se dressent. Mais il y a
                aussi des mains qui se tendent. Des inconnus qui deviennent
                des frères. Des gens qui croient en vous avant même que vous
                n&apos;ayez commencé.
              </p>
              <p>
                Cette marque est née de cette traversée. Elle est la preuve
                que quand on porte l&apos;essentiel en soi, on peut traverser
                n&apos;importe quel désert.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image pleine largeur */}
      <section className="h-[50vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1533130061792-64b345e4a833"
          alt=""
          className="w-full h-full object-cover"
        />
      </section>

      {/* Les valeurs */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mb-6">
              Ce qui nous tient
            </p>
            <h2 className="text-3xl md:text-4xl font-light mb-10 tracking-wide leading-tight">
              Trois choses nous portent
            </h2>

            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-light mb-3 tracking-wide">
                  L&apos;artisanat
                </h3>
                <p className="text-stone-600 font-light leading-relaxed">
                  Chaque sac est cousu une à une, à la main, dans un petit
                  atelier. Pas de chaîne, pas de machine qui remplace le geste.
                  Juste des doigts qui savent que le temps fait bien les choses.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-light mb-3 tracking-wide">
                  La résilience
                </h3>
                <p className="text-stone-600 font-light leading-relaxed">
                  On ne choisit pas toujours d&apos;où on part. Mais on choisit
                  ce qu&apos;on emporte. Nos sacs sont conçus pour durer, pour
                  traverser les épreuves, pour se bonifier avec les kilomètres.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-light mb-3 tracking-wide">
                  La gratitude
                </h3>
                <p className="text-stone-600 font-light leading-relaxed">
                  Cette marque n&apos;existerait pas sans celles et ceux qui ont
                  cru en nous. Des gens qui ont tendu la main sans rien attendre
                  en retour. Chaque sac est un hommage silencieux à ces
                  rencontres.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Citation */}
      <section className="py-20 md:py-28 bg-stone-900 text-white">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-3xl font-light italic leading-relaxed text-white/80"
          >
            &ldquo;On ne possède que ce qu&apos;on porte. Le reste, on l&apos;a
            déjà en nous.&rdquo;
          </motion.blockquote>
          <p className="text-white/40 text-sm mt-8 font-light">
            — L&apos;esprit Nomade
          </p>
        </div>
      </section>

      {/* Pour finir */}
      <section className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 md:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-8 tracking-wide">
              Et maintenant
            </h2>
            <p className="text-stone-500 font-light text-lg leading-relaxed mb-10">
              Aujourd&apos;hui, Nomade grandit. Mais l&apos;esprit reste le
              même : créer des sacs qui portent l&apos;essentiel. Pour ceux qui
              savent que le voyage est plus important que la destination.
            </p>
            <Link
              href="/boutique"
              className="inline-block bg-stone-900 text-white px-10 py-4 rounded-full text-sm tracking-wider font-light hover:bg-stone-800 transition-colors"
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