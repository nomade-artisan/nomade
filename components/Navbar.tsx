"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./CartContext";

const links = [
  { label: "Accueil", to: "/" },
  { label: "Boutique", to: "/boutique" },
  { label: "Notre histoire", to: "/histoire" },
  { label: "Contact", to: "/contact" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg md:text-2xl tracking-[0.2em] md:tracking-[0.25em] font-light text-stone-800 hover:text-stone-600 transition-colors flex-shrink-0"
          >
            NOMADE
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`text-sm tracking-[0.12em] uppercase font-light transition-all pb-1 border-b ${
                  pathname === link.to
                    ? "text-stone-800 border-stone-300"
                    : "text-stone-400 border-transparent hover:text-stone-700 hover:border-stone-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/cart"
              className="relative flex items-center text-stone-600 hover:text-stone-900 transition-colors"
              aria-label="Panier"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 md:w-5 md:h-5 bg-stone-800 text-white text-[10px] rounded-full flex items-center justify-center font-medium"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors flex-shrink-0"
              aria-label="Menu"
            >
              <span className="text-[10px] tracking-[0.15em] uppercase font-light">
                {menuOpen ? "Fermer" : "Menu"}
              </span>
              <span className="text-base">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col pt-6 pb-4 border-t border-stone-100 mt-4">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`py-3 text-base tracking-wider font-light transition-colors ${
                      pathname === link.to
                        ? "text-stone-800"
                        : "text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

export default Navbar;