"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  // ESC close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Scroll detection – seuil à 5px pour réactivité
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Détermine si la navbar doit être opaque
  const isOpaque = !isHome || scrolled;

  // --- Styles dynamiques ---
  // Fond : transparent (home en haut) ou blanc avec ombre
  const bgClass = isOpaque
    ? "bg-white/90 backdrop-blur-xl border-b border-stone-200/50 shadow-sm"
    : "bg-transparent";

  // Couleurs du texte
  const textColor = isOpaque ? "text-stone-900" : "text-white";
  const linkActive = isOpaque ? "text-stone-900" : "text-white";
  const linkInactive = isOpaque
    ? "text-stone-500 hover:text-stone-900"
    : "text-white/70 hover:text-white";

  // Panier
  const cartColor = isOpaque
    ? "text-stone-700 hover:text-stone-900"
    : "text-white/80 hover:text-white";
  const cartBadge = isOpaque
    ? "bg-stone-900 text-white"
    : "bg-white text-stone-900";

  // Burger
  const burgerLine = isOpaque ? "bg-stone-900" : "bg-white";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bgClass}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className={`uppercase tracking-[0.3em] font-light transition-colors duration-300 ${textColor}`}
            >
              <span className="text-[18px] md:text-[22px] tracking-[0.35em]">
                NOMADE
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-10">
              {links.map((link) => {
                const active = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    className={`relative text-[11px] uppercase tracking-[0.2em] font-light transition-colors duration-300 ${
                      active ? linkActive : linkInactive
                    } group`}
                  >
                    {link.label}
                    {/* Soulignement élégant */}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-px bg-current transform origin-left transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-6">
              {/* Panier */}
              <Link
                href="/cart"
                className={`relative transition-colors duration-300 ${cartColor}`}
                aria-label="Panier"
              >
                <svg
                  className="w-[20px] h-[20px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full text-[10px] font-medium flex items-center justify-center ${cartBadge}`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Burger mobile */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden relative w-8 h-8 flex items-center justify-center"
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={menuOpen}
              >
                <div className="relative w-5 h-5">
                  <span
                    className={`absolute left-0 w-5 h-px transition-all duration-300 ${burgerLine}`}
                    style={{
                      top: menuOpen ? "50%" : "2px",
                      transform: menuOpen ? "rotate(45deg)" : "rotate(0)",
                    }}
                  />
                  <span
                    className={`absolute left-0 w-5 h-px transition-all duration-300 ${burgerLine}`}
                    style={{
                      top: "50%",
                      opacity: menuOpen ? 0 : 1,
                    }}
                  />
                  <span
                    className={`absolute left-0 w-5 h-px transition-all duration-300 ${burgerLine}`}
                    style={{
                      bottom: menuOpen ? "50%" : "2px",
                      transform: menuOpen ? "rotate(-45deg)" : "rotate(0)",
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-20 right-4 left-auto z-50 md:hidden">
            <div className="w-[280px] rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200/70 shadow-xl overflow-hidden">
              <div className="px-6 py-6">
                <nav className="flex flex-col gap-1">
                  {links.map((link) => {
                    const active = pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        href={link.to}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between py-3.5 px-2 rounded-xl transition-all duration-200 ${
                          active
                            ? "bg-stone-100 text-stone-900"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        }`}
                      >
                        <span className="text-[15px] font-light tracking-[0.04em]">
                          {link.label}
                        </span>
                        {active && (
                          <span className="w-2 h-2 rounded-full bg-stone-900" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
                <div className="pt-6 mt-4 border-t border-stone-200/50">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-light">
                    Nomade
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;