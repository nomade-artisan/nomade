// app/success/SuccessClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      localStorage.removeItem("nomade-cart");
    }
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl font-thin text-stone-300 mb-4">.</p>
          <h1 className="text-2xl font-light mb-3">Page introuvable</h1>
          <p className="text-stone-500 font-light text-sm mb-8">
            Aucune commande en cours.
          </p>
          <Link
            href="/boutique"
            className="inline-block bg-stone-900 text-white px-6 py-3 rounded-full text-sm tracking-wider font-light hover:bg-stone-800 transition-colors"
          >
            Voir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
          {/* Check + Titre */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <svg
                className="w-7 h-7 text-emerald-600"
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
            <h1 className="text-2xl md:text-3xl font-light tracking-wide mb-2">
              Merci pour votre confiance
            </h1>
            <p className="text-stone-500 font-light text-sm max-w-sm mx-auto">
              Votre commande est confirmée. Nous la préparons avec soin.
            </p>
          </motion.div>

          {/* Étapes — compactes, en largeur */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          >
            {[
              {
                title: "Confirmation",
                desc: "Email dans quelques minutes",
              },
              {
                title: "Préparation",
                desc: "Votre sac est cousu à la main",
              },
              {
                title: "Expédition",
                desc: "3-5 jours, suivi par email",
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="bg-white rounded-xl p-5 border border-stone-100 text-center"
              >
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">
                  Étape {index + 1}
                </p>
                <h3 className="text-sm font-medium text-stone-800 mb-1">
                  {step.title}
                </h3>
                <p className="text-stone-500 text-xs font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Rappel */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-stone-400 text-xs font-light italic mb-8"
          >
            On ne possède que ce qu&apos;on porte. Votre sac arrive bientôt.
          </motion.p>

          {/* Boutons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/boutique"
              className="inline-block bg-stone-900 text-white px-6 py-3 rounded-full text-sm tracking-wider font-light hover:bg-stone-800 transition-colors"
            >
              Continuer mes achats
            </Link>
            <Link
              href="/contact"
              className="inline-block border border-stone-200 text-stone-600 px-6 py-3 rounded-full text-sm tracking-wider font-light hover:border-stone-400 transition-colors"
            >
              Une question ?
            </Link>
          </motion.div>

          {/* Référence */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-8 text-[10px] text-stone-300 font-light"
          >
            Réf. {sessionId.slice(-12)}
          </motion.p>
        </div>
      )}
    </div>
  );
}

export default SuccessClient;