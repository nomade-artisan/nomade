// app/histoire/HistoireClient.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/db";

// Helper pour récupérer l'URL publique d'une image du bucket "histoire"
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
      {/* HERO */}
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
                Notre histoire
              </p>
              <h1 className="text-white text-5xl md:text-7xl xl:text-8xl font-extralight leading-[0.95] tracking-[-0.04em] mb-10">
                Créer des objets
                <br />
                simples,
                <br />
                durables.
              </h1>
              <p className="text-white/70 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
                Nomade est une marque construite autour du temps, des matières et du goût pour les objets faits avec attention.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INTRO */}
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
                Là où tout commence
              </p>
              <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
                Une vision née
                <br />
                autour du
                <br />
                savoir-faire
                <br />
                et du détail.
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
                Nomade est né d’une fascination pour les objets qui traversent les années sans perdre leur caractère.
              </p>
              <p>
                Inspirée par le travail des matières et les méthodes artisanales, la marque s’est construite progressivement, à travers des essais, des ajustements et beaucoup d’attention portée aux détails.
              </p>
              <p>
                Chaque pièce est pensée pour être utile, équilibrée et durable.
              </p>
              <p>
                Nous croyons qu’un bel objet doit vivre longtemps, évoluer avec le temps et accompagner le quotidien naturellement.
              </p>
              <p>
                Aujourd’hui, Nomade continue d’avancer avec la même idée : créer lentement, produire avec exigence et construire une maison durable autour du savoir-faire.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* IMAGE PLEINE LARGEUR */}
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
            <p className="text-4xl md:text-6xl xl:text-7xl font-extralight leading-[1.1] tracking-[-0.03em]">
              Chaque détail
              <br />
              compte
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* POURQUOI */}
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
                Notre approche
              </p>
              <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
                Concevoir des pièces
                <br />
                pensées pour durer
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
                Nous privilégions des matières solides, des lignes simples et des finitions intemporelles.
              </p>
              <p>
                Le cuir évolue avec le temps, développe sa texture et rend chaque pièce unique.
              </p>
              <p>
                Cette évolution fait partie de l’objet. Elle raconte son usage, son quotidien et les années qui passent.
              </p>
              <p>
                Nous aimons l’idée qu’un produit puisse être conservé, réparé et transmis plutôt que remplacé.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
              Nos principes
            </p>
            <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
              Une manière simple
              <br />
              de faire les choses.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Le temps",
                text: "Créer lentement permet de porter attention à chaque finition et à chaque détail.",
              },
              {
                title: "La matière",
                text: "Chaque matière est choisie pour sa solidité, sa texture et sa capacité à durer.",
              },
              {
                title: "L’équilibre",
                text: "Des formes simples, utiles et pensées pour accompagner le quotidien durablement.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.8 }}
                className="bg-[#f8f5f1] rounded-[2rem] p-10 md:p-12 border border-stone-200/70"
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

      {/* CITATION */}
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
              “Créer moins.
              <br />
              Créer mieux.
              <br />
              Et créer pour durer”
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* CONCLUSION */}
      <section className="py-24 md:py-40">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-stone-400 uppercase tracking-[0.35em] text-[11px] mb-8">
              La suite
            </p>
            <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em] mb-10">
              L’histoire continue.
            </h2>
            <p className="text-stone-500 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-16">
              De nouvelles pièces arrivent progressivement, toujours avec la même attention portée aux matières, aux détails et au temps.
            </p>
            <Link
              href="/boutique"
              className="inline-flex items-center justify-center bg-stone-950 text-white px-10 md:px-14 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:bg-stone-800 transition-all duration-300"
            >
              Découvrir la collection
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}

export default HistoireClient;