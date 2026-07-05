
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function LivraisonClient() {
  return (
    <div className="bg-stone-50 min-h-screen pt-[64px]">

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">

        {/* HERO */}

        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className="mb-12 md:mb-16"
        >

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div>

              <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400 font-light mb-4">
                Livraison & retours
              </p>

              <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95]">
                Recevoir.
                <br />
                Essayer.
                <br />
                Continuer la route.
              </h1>

            </div>

            <p className="text-stone-500 font-light leading-relaxed text-base md:text-lg max-w-sm">
              Des délais simples,
              des retours sans friction,
              et toujours avec attention.
            </p>

          </div>

        </motion.div>

        {/* DELIVERY CARDS */}

        <div className="grid md:grid-cols-3 gap-4 mb-12">

          {/* STANDARD */}

          <motion.div
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.02,
              duration: 0.35,
            }}
            className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] overflow-hidden"
          >

            <div className="aspect-[4/3] overflow-hidden">

              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
                alt=""
                className="w-full h-full object-cover"
              />

            </div>

            <div className="p-5">

              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                Standard
              </p>

              <h2 className="text-lg font-light tracking-tight text-stone-900 mb-2">
                Livraison classique
              </h2>

              <p className="text-stone-500 text-sm font-light leading-relaxed mb-5">
                3 à 5 jours ouvrés
                <br />
                Colissimo suivi
              </p>

              <p className="text-2xl font-light tracking-tight">
                9,90 €
              </p>

            </div>

          </motion.div>

          {/* EXPRESS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
              duration: 0.35,
            }}
            className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] overflow-hidden"
          >

            <div className="aspect-[4/3] overflow-hidden">

              <img
                src="https://images.unsplash.com/photo-1559526324-4b87b5ae7252"
                alt=""
                className="w-full h-full object-cover"
              />

            </div>

            <div className="p-5">

              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                Express
              </p>

              <h2 className="text-lg font-light tracking-tight text-stone-900 mb-2">
                Livraison rapide
              </h2>

              <p className="text-stone-500 text-sm font-light leading-relaxed mb-5">
                1 à 2 jours ouvrés
                <br />
                Chronopost
              </p>

              <p className="text-2xl font-light tracking-tight">
                14,90 €
              </p>

            </div>

          </motion.div>

          {/* FREE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
              duration: 0.35,
            }}
            className="bg-emerald-50 border border-emerald-100 rounded-[30px] overflow-hidden"
          >

            <div className="aspect-[4/3] overflow-hidden">

              <img
                src="https://images.unsplash.com/photo-1533130061792-64b345e4a833"
                alt=""
                className="w-full h-full object-cover"
              />

            </div>

            <div className="p-5">

              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-600 font-light mb-3">
                Offerte
              </p>

              <h2 className="text-lg font-light tracking-tight text-emerald-900 mb-2">
                Livraison gratuite
              </h2>

              <p className="text-emerald-700 text-sm font-light leading-relaxed mb-5">
                Dès 100 €
                <br />
                en France métropolitaine
              </p>

              <p className="text-2xl font-light tracking-tight text-emerald-800">
                Gratuit
              </p>

            </div>

          </motion.div>

        </div>

        {/* INFORMATIONS */}

        <div className="grid lg:grid-cols-2 gap-5 mb-12">

          {/* LEFT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.35,
            }}
            className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] p-6 md:p-7"
          >

            <h3 className="text-xl font-light tracking-tight text-stone-900 mb-6">
              Préparation & suivi
            </h3>

            <div className="space-y-6">

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Préparation
                </p>

                <p className="text-stone-500 font-light leading-relaxed">
                  Chaque commande est préparée
                  sous 24 à 48 heures.
                  Chaque pièce est vérifiée à la main avant expédition.
                </p>

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Suivi
                </p>

                <p className="text-stone-500 font-light leading-relaxed">
                  Un email contenant votre numéro de suivi
                  est envoyé dès l’expédition.
                </p>

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                  Destinations
                </p>

                <p className="text-stone-500 font-light leading-relaxed">
                  France, Belgique, Luxembourg et Suisse.
                  <br />
                  Pour toute autre destination,
                  {" "}
                  <Link
                    href="/contact"
                    className="text-stone-700 underline underline-offset-4 hover:text-black transition-colors"
                  >
                    contactez-nous
                  </Link>
                  .
                </p>

              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.14,
              duration: 0.35,
            }}
            className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] overflow-hidden"
          >

            <div className="aspect-[4/3] overflow-hidden">

              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3"
                alt=""
                className="w-full h-full object-cover"
              />

            </div>

            <div className="p-6 md:p-7">

              <h3 className="text-xl font-light tracking-tight text-stone-900 mb-6">
                Retours & échanges
              </h3>

              <div className="space-y-5 text-stone-500 font-light leading-relaxed">

                <p>
                  Vous disposez de 30 jours
                  pour retourner votre commande.
                </p>

                <p>
                  Les retours sont gratuits
                  pour les produits non utilisés
                  dans leur emballage d’origine.
                </p>

                <p>
                  En cas de produit défectueux,
                  nous prenons tout en charge :
                  retour, échange ou remboursement.
                </p>

              </div>

            </div>

          </motion.div>

        </div>

        {/* RETURN STEPS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.18,
            duration: 0.35,
          }}
          className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[34px] p-6 md:p-8 mb-14"
        >

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">

            <div>

              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                Retours
              </p>

              <h2 className="text-2xl md:text-3xl font-light tracking-tight">
                Comment faire un retour
              </h2>

            </div>

            <p className="text-stone-500 font-light max-w-sm leading-relaxed">
              Un processus simple,
              pensé pour rester fluide.
            </p>

          </div>

          <div className="grid md:grid-cols-4 gap-4">

            {[
              {
                number: "01",
                text:
                  "Écrivez-nous avec votre numéro de commande.",
              },
              {
                number: "02",
                text:
                  "Recevez une étiquette de retour prépayée.",
              },
              {
                number: "03",
                text:
                  "Déposez votre colis dans un point relais.",
              },
              {
                number: "04",
                text:
                  "Le remboursement est effectué sous 5 à 7 jours.",
              },
            ].map((step) => (

              <div
                key={step.number}
                className="border border-stone-200 rounded-[24px] p-5"
              >

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-5">
                  {step.number}
                </p>

                <p className="text-stone-600 font-light leading-relaxed text-sm">
                  {step.text}
                </p>

              </div>

            ))}

          </div>

        </motion.div>

        {/* CONTACT */}

        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.22,
            duration: 0.35,
          }}
          className="relative rounded-[36px] overflow-hidden"
        >

          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
            alt=""
            className="w-full h-[280px] md:h-[340px] object-cover"
          />

          <div className="absolute inset-0 bg-stone-900/55 flex items-center justify-center">

            <div className="text-center px-6">

              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-5">
                Une question ?
              </h2>

              <p className="text-white/65 font-light leading-relaxed max-w-md mx-auto mb-8">
                Nous répondons personnellement,
                toujours avec attention.
              </p>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-white text-stone-900 px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-light hover:bg-stone-100 transition-colors"
              >
                Nous contacter
              </Link>

            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}

export default LivraisonClient;