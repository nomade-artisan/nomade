// app/livraison/LivraisonClient.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function LivraisonClient() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-stone-50 min-h-screen"
    >
      {/* Hero */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-4">
              Infos pratiques
            </p>
            <h1 className="text-4xl md:text-6xl font-light text-white tracking-wide">
              Livraison & Retours
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24">
        {/* Livraison */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-light tracking-wide">
              Livraison
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Standard */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-100">
              <div className="h-40 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-light text-stone-800 mb-2">
                  Livraison standard
                </h3>
                <p className="text-stone-400 text-sm font-light mb-4">
                  3 à 5 jours ouvrés — Colissimo suivi
                </p>
                <p className="text-2xl font-light text-stone-800">9,90 €</p>
              </div>
            </div>

            {/* Express */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-100">
              <div className="h-40 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1559526324-4b87b5ae7252"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-light text-stone-800 mb-2">
                  Livraison express
                </h3>
                <p className="text-stone-400 text-sm font-light mb-4">
                  1 à 2 jours ouvrés — Chronopost
                </p>
                <p className="text-2xl font-light text-stone-800">14,90 €</p>
              </div>
            </div>
          </div>

          {/* Gratuite */}
          <div className="bg-emerald-50 rounded-2xl overflow-hidden border border-emerald-100 mb-10">
            <div className="grid md:grid-cols-2">
              <div className="h-48 md:h-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1533130061792-64b345e4a833"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-xl font-light text-emerald-800 mb-3">
                  Livraison offerte
                </h3>
                <p className="text-emerald-600 text-sm font-light mb-2">
                  Dès 150 € d&apos;achat
                </p>
                <p className="text-3xl font-light text-emerald-700">Gratuit</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-stone-600 font-light leading-relaxed">
            <div>
              <h3 className="text-lg font-light text-stone-800 mb-2">
                Préparation
              </h3>
              <p>
                Nous préparons votre commande sous 24 à 48 heures ouvrées.
                Chaque sac est vérifié à la main avant de partir. On prend le
                temps qu&apos;il faut.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-light text-stone-800 mb-2">
                Zones desservies
              </h3>
              <p>
                France métropolitaine, Belgique, Luxembourg, Suisse. Pour les
                autres destinations,{" "}
                <Link
                  href="/contact"
                  className="text-stone-800 underline underline-offset-4 hover:text-stone-600 transition-colors"
                >
                  contactez-nous
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="text-lg font-light text-stone-800 mb-2">
                Suivi de commande
              </h3>
              <p>
                Un email avec votre numéro de suivi vous est envoyé dès
                l&apos;expédition. Vous pouvez suivre votre colis à tout moment
                sur le site du transporteur.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Retours */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-light tracking-wide">
              Retours & Échanges
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-8 border border-stone-100">
              <h3 className="text-lg font-light text-stone-800 mb-4">
                Vous avez changé d&apos;avis
              </h3>
              <p className="text-stone-500 text-sm font-light leading-relaxed mb-4">
                30 jours pour retourner votre sac. Gratuitement. Sans
                justification.
              </p>
              <div className="flex items-center gap-3 text-sm text-stone-400 font-light">
                <span>📦</span>
                <span>Retour gratuit</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-stone-100">
              <h3 className="text-lg font-light text-stone-800 mb-4">
                Produit défectueux
              </h3>
              <p className="text-stone-500 text-sm font-light leading-relaxed mb-4">
                Contactez-nous sous 48h avec des photos. On prend tout en
                charge.
              </p>
              <div className="flex items-center gap-3 text-sm text-stone-400 font-light">
                <span>🛡️</span>
                <span>Garanti 2 ans</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-10">
            <div className="h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <h3 className="text-lg font-light text-stone-800 mb-4">
                Comment faire un retour
              </h3>
              <ol className="space-y-4 text-stone-600 font-light text-sm leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Écrivez-nous à{" "}
                    <a
                      href="mailto:bonjour@nomade.fr"
                      className="text-stone-800 underline underline-offset-4 hover:text-stone-600 transition-colors"
                    >
                      bonjour@nomade.fr
                    </a>{" "}
                    avec votre numéro de commande.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Nous vous envoyons une étiquette de retour prépayée par
                    email.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Déposez le colis dans le point relais le plus proche.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    4
                  </span>
                  <span>
                    Une fois reçu et vérifié, nous procédons au remboursement
                    sous 5 à 7 jours.
                  </span>
                </li>
              </ol>
            </div>
          </div>

          <div className="space-y-6 text-stone-600 font-light leading-relaxed">
            <div>
              <h3 className="text-lg font-light text-stone-800 mb-2">
                Conditions
              </h3>
              <ul className="space-y-2">
                {[
                  "Le sac doit être dans son état d'origine, non utilisé, avec son emballage.",
                  "Les retours sont traités sous 5 à 7 jours ouvrés après réception.",
                  "Le remboursement est effectué sur le moyen de paiement utilisé lors de la commande.",
                  "Les frais de livraison initiaux sont remboursés uniquement en cas de produit défectueux.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-stone-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1"
            alt=""
            className="w-full h-64 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-2xl md:text-3xl font-light text-white tracking-wide mb-4">
              Une question ?
            </h2>
            <p className="text-white/60 font-light mb-8 max-w-md">
              On vous répond sous 24 heures. Toujours avec soin.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-stone-900 px-8 py-3 rounded-full text-sm tracking-wider font-light hover:bg-stone-100 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default LivraisonClient;