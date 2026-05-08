// app/success/SuccessClient.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

function SuccessClient() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // On ne vide que si on a un session_id (preuve que le paiement a été initié)
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-stone-50 flex items-center justify-center"
    >
      <div className="text-center px-6 max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="text-6xl mb-6"
        >
          ✓
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-4">
          Merci
        </h1>
        <p className="text-stone-500 font-light mb-2 leading-relaxed">
          Votre commande a bien été reçue.
        </p>
        <p className="text-stone-400 text-sm font-light mb-10">
          Vous recevrez un email de confirmation dans quelques instants.
        </p>

        <Link
          href="/boutique"
          className="inline-block bg-stone-900 text-white px-8 py-4 rounded-full text-sm tracking-wider font-light hover:bg-stone-800 transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    </motion.div>
  );
}

export default SuccessClient;