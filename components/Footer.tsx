import Link from "next/link";

function Footer() {
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

  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        {/* Mobile : 1 colonne, Desktop : 5 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 md:gap-12">
          {/* Marque — pleine largeur sur mobile */}
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

          {/* Newsletter — pleine largeur sur mobile */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-5 font-light">
              Restez nomade
            </h3>
            <p className="text-stone-400 text-xs font-light mb-4 leading-relaxed">
              Recevez nos actualités et offres exclusives.
            </p>
            <form className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 min-w-0 bg-stone-800 border border-stone-700 text-white text-sm px-4 py-2 rounded-lg font-light placeholder-stone-500 focus:outline-none focus:border-stone-500 transition-colors"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-stone-700 hover:bg-stone-600 text-white text-sm px-4 py-2 rounded-lg font-light transition-colors"
              >
                OK
              </button>
            </form>
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