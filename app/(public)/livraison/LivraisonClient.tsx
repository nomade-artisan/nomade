
"use client";

import { motion } from "framer-motion";
import { MessageCircle, PackageCheck, RotateCcw, Truck } from "lucide-react";
import Link from "next/link";

function parseShippingSetting(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function formatEuro(value: number, maximumFractionDigits = 2) {
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits })} €`;
}

function LivraisonClient() {
  const shippingCost = parseShippingSetting(
    process.env.NEXT_PUBLIC_SHIPPING_COST,
    8.11
  );
  const freeShippingThreshold = parseShippingSetting(
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD,
    120
  );

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

        <div className="grid items-stretch md:grid-cols-3 gap-4 mb-12">

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
            className="h-full flex flex-col bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] overflow-hidden"
          >

            <div aria-hidden="true" className="flex h-28 shrink-0 items-center justify-center bg-stone-100/80">
              <Truck className="h-10 w-10 text-stone-500" strokeWidth={1.25} />
            </div>

            <div className="flex flex-1 flex-col p-5">

              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                Standard
              </p>

              <h2 className="text-lg font-light tracking-tight text-stone-900 mb-2">
                Livraison standard
              </h2>

              <p className="text-stone-500 text-sm font-light leading-relaxed mb-5">
                3 à 5 jours ouvrés
                <br />
                Colissimo suivi
              </p>

              <p className="mt-auto pt-5 text-2xl font-light tracking-tight">
                {formatEuro(shippingCost)}
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
            className="h-full flex flex-col bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] overflow-hidden"
          >

            <div aria-hidden="true" className="flex h-28 shrink-0 items-center justify-center bg-stone-100/80">
              <RotateCcw className="h-10 w-10 text-stone-500" strokeWidth={1.25} />
            </div>

            <div className="flex flex-1 flex-col p-5">

              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-3">
                Retours
              </p>

              <h2 className="text-lg font-light tracking-tight text-stone-900 mb-2">
                Retours gratuits
              </h2>

              <p className="text-stone-500 text-sm font-light leading-relaxed mb-5">
                Jusqu’à 15 jours après réception
                <br />
                Étiquette prépayée
              </p>

              <p className="mt-auto pt-5 text-2xl font-light tracking-tight">
                Gratuit
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
            className="h-full flex flex-col bg-emerald-50 border border-emerald-100 rounded-[30px] overflow-hidden"
          >

            <div aria-hidden="true" className="flex h-28 shrink-0 items-center justify-center bg-emerald-100/80">
              <PackageCheck className="h-10 w-10 text-emerald-700" strokeWidth={1.25} />
            </div>

            <div className="flex flex-1 flex-col p-5">

              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-600 font-light mb-3">
                Offerte
              </p>

              <h2 className="text-lg font-light tracking-tight text-emerald-900 mb-2">
                Livraison gratuite
              </h2>

              <p className="text-emerald-700 text-sm font-light leading-relaxed mb-5">
                Dès {formatEuro(freeShippingThreshold, 0)}
                <br />
                dans les zones desservies
              </p>

              <p className="mt-auto pt-5 text-2xl font-light tracking-tight text-emerald-800">
                Gratuit
              </p>

            </div>

          </motion.div>

        </div>

        {/* INFORMATIONS */}

        <div className="grid items-stretch lg:grid-cols-2 gap-5 mb-12">

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
            className="h-full bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] p-6 md:p-7"
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
            className="h-full bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[30px] p-6 md:p-7"
          >

              <h3 className="text-xl font-light tracking-tight text-stone-900 mb-6">
                Retours & échanges
              </h3>

              <div className="space-y-5 text-stone-500 font-light leading-relaxed">

                <p>
                  Vous disposez de 15 jours
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

          <div className="grid items-stretch md:grid-cols-4 gap-4">

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
                className="h-full border border-stone-200 rounded-[24px] p-5"
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

          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-950" />
          <div aria-hidden="true" className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-10 h-52 w-52 rounded-full border border-white/10" />

          <div className="relative flex min-h-[280px] items-center justify-center md:min-h-[340px]">

            <div className="text-center px-6">

              <MessageCircle aria-hidden="true" className="mx-auto mb-5 h-8 w-8 text-white/75" strokeWidth={1.25} />

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
