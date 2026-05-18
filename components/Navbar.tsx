"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./CartContext";

const links = [
  { label: "Accueil", to: "/" },
  { label: "Boutique", to: "/boutique" },
  { label: "Histoire", to: "/histoire" },
  { label: "Contact", to: "/contact" },
];

function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const isHome = pathname === "/";

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ESC CLOSE

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // LOCK BODY

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // CLOSE MENU ON ROUTE CHANGE

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // SCROLL EFFECT

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* NAVBAR */}

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${
            isHome && !scrolled
              ? "bg-transparent"
              : "bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/50"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">

          <div className="h-20 flex items-center justify-between">

            {/* LOGO */}

            <Link
              href="/"
              className={`uppercase tracking-[0.28em] font-light transition-colors duration-300
                ${
                  isHome && !scrolled
                    ? "text-white"
                    : "text-stone-900"
                }`}
            >
              <span className="text-[17px] md:text-[20px]">
                NOMADE
              </span>
            </Link>

            {/* DESKTOP NAV */}

            <div className="hidden md:flex items-center gap-8">

              {links.map((link) => {
                const active = pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    className={`relative text-[11px] uppercase tracking-[0.18em] transition-colors duration-300
                      ${
                        isHome && !scrolled
                          ? active
                            ? "text-white"
                            : "text-white/70 hover:text-white"
                          : active
                          ? "text-stone-900"
                          : "text-stone-500 hover:text-stone-900"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-5">

              {/* CART */}

              <Link
                href="/cart"
                className={`relative transition-colors duration-300
                  ${
                    isHome && !scrolled
                      ? "text-white/70 hover:text-white"
                      : "text-stone-700 hover:text-black"
                  }`}
                aria-label="Panier"
              >

                <svg
                  className="w-[19px] h-[19px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.4}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>

                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-2 -right-2 min-w-[16px] h-[16px] rounded-full text-[9px] flex items-center justify-center
                      ${
                        isHome && !scrolled
                          ? "bg-white text-black"
                          : "bg-stone-900 text-white"
                      }`}
                  >
                    {cartCount}
                  </motion.span>
                )}

              </Link>

              {/* MOBILE BUTTON */}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden relative w-8 h-8 flex items-center justify-center"
                aria-label="Menu"
              >

                <div className="relative w-5 h-5">

                  <motion.span
                    animate={{
                      rotate: menuOpen ? 45 : 0,
                      y: menuOpen ? 0 : -4,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`absolute left-0 top-1/2 w-5 h-px
                      ${
                        isHome && !scrolled
                          ? "bg-white"
                          : "bg-stone-900"
                      }`}
                  />

                  <motion.span
                    animate={{
                      opacity: menuOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`absolute left-0 top-1/2 w-5 h-px
                      ${
                        isHome && !scrolled
                          ? "bg-white"
                          : "bg-stone-900"
                      }`}
                  />

                  <motion.span
                    animate={{
                      rotate: menuOpen ? -45 : 0,
                      y: menuOpen ? 0 : 4,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`absolute left-0 top-1/2 w-5 h-px
                      ${
                        isHome && !scrolled
                          ? "bg-white"
                          : "bg-stone-900"
                      }`}
                  />

                </div>

              </button>

            </div>

          </div>

        </div>

      </motion.nav>

      {/* FLOATING MENU */}

      <AnimatePresence>

        {menuOpen && (
          <>

            {/* BACKDROP */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 md:hidden"
            />

            {/* FLOATING PANEL */}

            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              className="fixed top-20 right-4 left-auto z-50 md:hidden"
            >

              <div className="w-[260px] rounded-2xl bg-white/96 border border-stone-200/70 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">

                <div className="px-6 py-5">

                  {/* LINKS */}

                  <nav className="flex flex-col">

                    {links.map((link, i) => {
                      const active = pathname === link.to;

                      return (
                        <motion.div
                          key={link.to}
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.03,
                          }}
                        >

                          <Link
                            href={link.to}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center justify-between py-3 border-b border-stone-100/80 last:border-none transition-colors
                              ${
                                active
                                  ? "text-stone-900"
                                  : "text-stone-500 hover:text-stone-900"
                              }`}
                          >

                            <span className="text-[15px] font-light tracking-[0.04em]">
                              {link.label}
                            </span>

                            {active && (
                              <motion.div
                                layoutId="menu-indicator"
                                className="w-1.5 h-1.5 rounded-full bg-stone-900"
                              />
                            )}

                          </Link>

                        </motion.div>
                      );
                    })}

                  </nav>

                  {/* FOOTER */}

                  <div className="pt-5 mt-3">

                    <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">
                      Nomade
                    </p>

                  </div>

                </div>

              </div>

            </motion.div>

          </>
        )}

      </AnimatePresence>
    </>
  );
}

export default Navbar;