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
                Façonner
                <br />
                le beau,
                <br />
                lentement.
              </h1>
              <p className="text-white/70 text-lg md:text-2xl font-light leading-relaxed max-w-2xl">
                Nomade est né de la volonté de créer des sacs qui traversent le temps — et les frontières.
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
                Un atelier
                <br />
                à Alès,
                <br />
                une Singer
                <br />
                d’un autre temps,
                <br />
                et l’envie
                <br />
                de bien faire.
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
                Tout a débuté dans une petite pièce lumineuse du Gard, avec une vieille machine à coudre Singer 31K15 et quelques outils essentiels. Rien de plus. L’essentiel était ailleurs : dans la patience, la curiosité, et le désir d’apprendre un métier exigeant.
              </p>
              <p>
                Les fondateurs de Nomade viennent d’horizons différents — l’un porte en lui les couleurs et la résilience du Congo, l’autre a grandi entre tourisme et scoutisme. Leur rencontre a fait naître une idée simple : créer une marque de sacs en cuir, à échelle humaine, où chaque pièce serait le fruit d’un travail soigné.
              </p>
              <p>
                Aujourd’hui, l’atelier est leur terrain d’expérimentation. On y prototypage, on y coud, on y défait parfois. Et chaque jour, la marque se construit un peu plus, au rythme du cuir que l’on travaille.
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
            <p className="text-3xl md:text-6xl xl:text-7xl font-extralight leading-[1.1] tracking-[-0.03em]">
              « Chaque point
              <br />
              compte. »
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
                Le choix du cuir
              </p>
              <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
                Une matière
                <br />
                vivante,
                <br />
                un héritage.
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
                Le cuir pleine fleur s’impose comme une évidence. Il ne se démode pas, il se patine avec élégance. Il raconte le temps qui passe, les voyages, les gestes du quotidien. Une matière noble, profondément ancrée dans l’artisanat.
              </p>
              <p>
                Pour maîtriser sa transformation, l’équipe s’est formée sur le tas, guidée par deux ouvrages de référence — <em>Sacs en cuir</em> de Yoko Ganaha, <em>Modélisme pour la maroquinerie</em> d’Elisa Cigna et Andrea Marcocci. Chaque étape a été apprise avec rigueur : coupe, couture, finition. Sans professeur, mais avec une exigence constante.
              </p>
              <p>
                Aujourd’hui, les premiers prototypes prennent forme. La collection n’est pas encore en vente, mais l’intention est déjà là : proposer des sacs conçus pour durer, réparables, intemporels.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
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
              Nos principes
            </p>
            <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em]">
              Créer moins,
              <br />
              créer mieux.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Le temps",
                text: "Chaque sac demande des heures de travail. Nous prenons ce temps parce que c’est lui qui donne sa valeur à l’objet.",
              },
              {
                title: "La matière",
                text: "Cuir pleine fleur, toile robuste, bouclerie massive. Nous sélectionnons ce qui vieillit le mieux, pour que chaque pièce raconte une histoire.",
              },
              {
                title: "L’essentiel",
                text: "Des lignes simples, des volumes justes. Nous allons à l’essentiel pour que le sac devienne un compagnon de tous les jours.",
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
              Une conviction
            </p>
            <blockquote className="text-4xl md:text-7xl font-extralight italic leading-[1.15] tracking-[-0.04em] text-white/90">
              « On ne possède
              <br />
              jamais vraiment
              <br />
              un sac Nomade.
              <br />
              On le transmet. »
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
              Et maintenant
            </p>
            <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-[-0.03em] mb-10">
              L’atelier avance.
            </h2>
            <p className="text-stone-500 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-16">
              Les premiers sacs sont en prototypage. Bientôt, ils seront prêts à vous accompagner. D’ici là, nous continuons à apprendre, à coudre, à améliorer chaque détail. Avec une seule idée en tête : faire de Nomade une maison artisanale, durable, et profondément humaine.
            </p>
            <Link
              href="/boutique"
              className="inline-flex items-center justify-center bg-stone-950 text-white px-10 md:px-14 py-5 rounded-full uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-all duration-300"
            >
              Suivre l’aventure
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
}

export default HistoireClient;