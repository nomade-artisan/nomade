// app/success/SuccessClient.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (sessionId) {
      localStorage.removeItem(
        "nomade-cart"
      );
    }

    const timer = setTimeout(
      () => setLoading(false),
      900
    );

    return () =>
      clearTimeout(timer);
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">

        <div className="text-center">

          <p className="text-5xl font-thin text-stone-300 mb-5">
            .
          </p>

          <h1 className="text-2xl font-light tracking-tight mb-3">
            Page introuvable
          </h1>

          <p className="text-stone-500 font-light text-sm mb-8">
            Aucune commande en cours.
          </p>

          <Link
            href="/boutique"
            className="inline-flex items-center justify-center bg-stone-900 text-white px-7 py-3.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-light hover:bg-stone-800 transition-colors"
          >
            Voir la boutique
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-[64px] overflow-hidden">

      {loading ? (

        <div className="min-h-screen flex items-center justify-center">

          <div className="relative">

            <div className="w-9 h-9 border border-stone-200 rounded-full" />

            <div className="absolute inset-0 w-9 h-9 border border-transparent border-t-stone-700 rounded-full animate-spin" />

          </div>

        </div>

      ) : (

        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* HERO */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="text-center mb-14 md:mb-16"
          >

            {/* CHECK */}

            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.35,
              }}
              className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6"
            >

              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />

              </svg>

            </motion.div>

            {/* TEXT */}

            <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400 font-light mb-5">
              Commande confirmée
            </p>

            <h1 className="text-3xl md:text-5xl font-light tracking-tight leading-[0.95] mb-5">
              Merci pour
              <br />
              votre confiance.
            </h1>

            <p className="text-stone-500 font-light leading-relaxed text-base md:text-lg max-w-md mx-auto">
              Votre commande est confirmée.
              Nous la préparons avec soin.
            </p>

          </motion.div>

          {/* STEPS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
              duration: 0.4,
            }}
            className="grid md:grid-cols-3 gap-4 mb-12"
          >

            {[
              {
                number: "01",
                title: "Confirmation",
                text:
                  "Un email de confirmation arrive dans quelques minutes.",
              },

              {
                number: "02",
                title: "Préparation",
                text:
                  "Votre pièce est préparée et vérifiée à la main.",
              },

              {
                number: "03",
                title: "Expédition",
                text:
                  "Livraison sous 3 à 5 jours avec suivi par email.",
              },
            ].map((step) => (

              <div
                key={step.number}
                className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[28px] p-5 md:p-6"
              >

                <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-light mb-5">
                  {step.number}
                </p>

                <h2 className="text-base font-light tracking-tight text-stone-900 mb-3">
                  {step.title}
                </h2>

                <p className="text-stone-500 text-sm font-light leading-relaxed">
                  {step.text}
                </p>

              </div>

            ))}

          </motion.div>

          {/* QUOTE */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.16,
              duration: 0.4,
            }}
            className="text-center mb-12"
          >

            <p className="text-stone-400 text-sm md:text-base font-light italic leading-relaxed">
              “ On ne possède vraiment
              que ce que l’on porte avec soi. ”
            </p>

          </motion.div>

          {/* BUTTONS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.22,
              duration: 0.4,
            }}
            className="flex flex-wrap justify-center gap-4"
          >

            <Link
              href="/boutique"
              className="inline-flex items-center justify-center bg-stone-900 text-white px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-light hover:bg-stone-800 transition-colors"
            >
              Continuer
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-stone-200 text-stone-600 px-8 py-3.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-light hover:border-stone-400 hover:text-stone-900 transition-colors"
            >
              Une question
            </Link>

          </motion.div>

          {/* REF */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.28,
              duration: 0.4,
            }}
            className="text-center mt-10"
          >

            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-300 font-light">
              Réf.{" "}
              {sessionId.slice(-12)}
            </p>

          </motion.div>

        </div>

      )}

    </div>
  );
}

export default SuccessClient;