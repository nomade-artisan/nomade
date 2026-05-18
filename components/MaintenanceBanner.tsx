// components/MaintenanceBanner.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function MaintenanceBanner() {
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (!isMaintenance) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.7, ease: "easeOut" }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg"
    >
      <div className="bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-2xl px-5 py-3 shadow-2xl text-center">
        <p className="text-stone-300 text-[11px] md:text-xs font-light leading-relaxed">
          Notre collection est en préparation. Les produits affichés sont un aperçu.{" "}
          <Link
            href="/contact"
            className="text-white underline underline-offset-4 hover:text-stone-300 transition-colors font-normal"
          >
            Contactez-nous
          </Link>{" "}
          pour toute question.
        </p>
      </div>
    </motion.div>
  );
}

export default MaintenanceBanner;