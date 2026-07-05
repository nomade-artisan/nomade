"use client";

import { useState } from "react";
import Link from "next/link";

function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const boutiqueLinks = [
    { label: "Tous les sacs", to: "/boutique" },
    { label: "Nouveautés", to: "/boutique?filter=nouveautes" },
    { label: "Best-sellers", to: "/boutique?filter=best" },
  ];

  const serviceLinks = [
    { label: "Notre histoire", to: "/histoire" },
    { label: "Contact", to: "/contact" },
    { label: "Livraison & Retours", to: "/livraison" },
    { label: "FAQ", to: "/faq" },
  ];

  const legalLinks = [
    { label: "Mentions légales", to: "/mentions-legales" },
    { label: "CGV", to: "/cgv" },
    { label: "Confidentialité", to: "/confidentialite" },
  ];

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 md:gap-12">
          {/* Marque */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-xl tracking-[0.25em] font-light text-white hover:text-white/70 transition-colors"
            >
              NOMADE
            </Link>
            <p className="text-stone-400 text-sm font-light mt-4 leading-relaxed max-w-xs">
              Des sacs pour ceux qui savent que l&apos;essentiel est à l&apos;intérieur.
            </p>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-5 font-light">
              Boutique
            </h3>
            <ul className="space-y-3">
              {boutiqueLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.to}
                    className="text-stone-400 hover:text-white text-sm font-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-5 font-light">
              Service
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.to}
                    className="text-stone-400 hover:text-white text-sm font-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-5 font-light">
              Légal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.to}
                    className="text-stone-400 hover:text-white text-sm font-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-5 font-light">
              Restez nomade
            </h3>
            <p className="text-stone-400 text-xs font-light mb-4 leading-relaxed">
              Recevez nos actualités et offres exclusives.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                className="flex-1 min-w-0 bg-stone-800 border border-stone-700 text-white text-sm px-4 py-2 rounded-lg font-light placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={`flex-shrink-0 text-sm px-4 py-2 rounded-lg font-light transition-colors ${
                  status === "success"
                    ? "bg-emerald-700 text-white"
                    : status === "error"
                    ? "bg-red-700 text-white"
                    : "bg-stone-700 hover:bg-stone-600 text-white"
                }`}
              >
                {status === "loading" ? "..." : status === "success" ? "✓" : status === "error" ? "✕" : "OK"}
              </button>
            </form>
            {status === "success" && (
              <p className="text-emerald-400 text-xs mt-2 font-light">Bienvenue dans la tribu.</p>
            )}
            {status === "error" && (
              <p className="text-red-400 text-xs mt-2 font-light">Une erreur est survenue.</p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-xs font-light">
            © {new Date().getFullYear()} Nomade. Tous droits réservés.
          </p>
          <p className="text-stone-500 text-xs font-light italic">
            On ne possède que ce qu&apos;on porte
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;