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

  // Scroll detection – plus rapide (10px au lieu de 20px)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled;

  // Couleurs dynamiques
const logoColor = solid ? "text-stone-900" : "text-white";

const linkActive = solid
  ? "text-stone-900"
  : "text-white";

const linkInactive = solid
  ? "text-stone-500 hover:text-stone-900"
  : "text-white/70 hover:text-white";

const cartColor = solid
  ? "text-stone-700 hover:text-black"
  : "text-white/70 hover:text-white";

const cartBadge = solid
  ? "bg-stone-900 text-white"
  : "bg-white text-black";

const burgerLine = solid
  ? "bg-stone-900"
  : "bg-white";

  return (
    <>
      {/* ========== NAVBAR ========== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solid
            ? "bg-white/85 backdrop-blur-xl border-b border-stone-200/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className={`uppercase tracking-[0.28em] font-light transition-colors duration-200 ${logoColor}`}
            >
              <span className="text-[17px] md:text-[20px]">NOMADE</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link) => {
                const active = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    className={`relative text-[11px] uppercase tracking-[0.18em] transition-colors duration-200 ${
                      active ? linkActive : linkInactive
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-5">
              {/* Cart */}
              <Link
                href="/cart"
                className={`relative transition-colors duration-200 ${cartColor}`}
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
                  <span
                    className={`absolute -top-2 -right-2 min-w-[16px] h-[16px] rounded-full text-[9px] flex items-center justify-center ${cartBadge}`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile burger */}
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

      {/* ========== FLOATING MENU ========== */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-20 right-4 left-auto z-50 md:hidden">
            <div className="w-[260px] rounded-2xl bg-white/96 border border-stone-200/70 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="px-6 py-5">
                <nav className="flex flex-col">
                  {links.map((link) => {
                    const active = pathname === link.to;
                    return (
                      <Link
                        key={link.to}
                        href={link.to}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between py-3 border-b border-stone-100/80 last:border-none transition-colors ${
                          active
                            ? "text-stone-900"
                            : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        <span className="text-[15px] font-light tracking-[0.04em]">
                          {link.label}
                        </span>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
                <div className="pt-5 mt-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">
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