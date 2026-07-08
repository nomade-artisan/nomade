"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl font-thin text-stone-300 mb-6"
        >
          .
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-thin text-stone-300 mb-4"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-light text-stone-500 mb-8"
        >
          Cette page n&apos;existe pas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/"
            className="inline-block bg-stone-900 text-white px-6 py-3 rounded-full text-sm tracking-wider font-light hover:bg-stone-800 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </motion.div>
      </div>
    </div>
  );
}