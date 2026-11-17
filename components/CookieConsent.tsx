"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateAnalyticsConsent } from "@/lib/analytics/tracking";

const CONSENT_KEY = "analytics-consent";
const LEGAL_PAGES = ["/confidentialite", "/cgv", "/mentions-legales"] as const;

type ConsentType = "accepted" | "essential" | null;

function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentType>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [forcedOpen, setForcedOpen] = useState(false);
  const [consentError, setConsentError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentType;
    setConsent(stored);
    if (!stored) setShowBanner(true);

    const openSettings = () => {
      setForcedOpen(true);
      setShowBanner(true);
    };
    window.addEventListener("open-cookie-settings", openSettings);
    return () => window.removeEventListener("open-cookie-settings", openSettings);
  }, []);

  const acceptAll = useCallback(async () => {
    setConsentError(false);
    const consentSaved = await updateAnalyticsConsent("accepted");
    if (!consentSaved) {
      setConsentError(true);
      return;
    }

    // Démarre une session de mesure neuve au moment où le consentement est donné.
    localStorage.removeItem("visitor_id");
    sessionStorage.removeItem("session_id");
    sessionStorage.removeItem("traffic-source-tracked");
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
    setShowBanner(false);
    setForcedOpen(false);
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: { type: "accepted" } }));
  }, []);

  const acceptEssential = useCallback(() => {
    void updateAnalyticsConsent("essential");
    localStorage.setItem(CONSENT_KEY, "essential");
    localStorage.removeItem("visitor_id");
    sessionStorage.removeItem("session_id");
    sessionStorage.removeItem("traffic-source-tracked");
    setConsent("essential");
    setShowBanner(false);
    setForcedOpen(false);
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: { type: "essential" } }));
  }, []);

  return {
    consent,
    showBanner,
    setShowBanner,
    mounted,
    forcedOpen,
    consentError,
    acceptAll,
    acceptEssential,
  };
}

export default function CookieConsent() {
  const pathname = usePathname();
  const {
    consent,
    showBanner,
    setShowBanner,
    mounted,
    forcedOpen,
    consentError,
    acceptAll,
    acceptEssential,
  } = useCookieConsent();

  if (
    !mounted ||
    (LEGAL_PAGES.includes(pathname as (typeof LEGAL_PAGES)[number]) && !forcedOpen)
  ) {
    return null;
  }

  return (
    <>
    <AnimatePresence mode="wait">
      {showBanner && (
        <motion.div
          key="cookie-banner"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[480px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-stone-200/80 z-50"
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-description"
        >
          {/* Ornement discret – ligne très fine, ton pierre */}
          <div className="flex justify-center -mt-[1px]">
            <div className="h-[1px] w-16 bg-stone-300/60" />
          </div>

          <div className="p-8 pt-6">
            <div className="flex items-start justify-between mb-4">
              <h3
                id="cookie-title"
                className="font-serif text-lg font-medium text-stone-900 tracking-wide"
              >
                Confidentialité
              </h3>
              <button
                type="button"
                onClick={acceptEssential}
                className="text-stone-400 hover:text-stone-600 transition-colors p-1 -mt-1"
                aria-label="Fermer et conserver les fonctions essentielles"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p id="cookie-description" className="text-sm text-stone-600 leading-relaxed font-light">
              Les statistiques de navigation ne sont activées qu’avec votre accord.
              Vous pouvez modifier votre choix à tout moment dans les préférences en bas de page.
            </p>

            <div className="text-xs text-stone-500 mt-4 leading-relaxed space-x-1">
              <span>Pour en savoir plus, consultez notre</span>
              <Link
                href="/confidentialite"
                className="underline underline-offset-2 hover:text-stone-700 font-medium transition-colors"
              >
                Politique de confidentialité
              </Link>
              <span>et nos</span>
              <Link
                href="/cgv"
                className="underline underline-offset-2 hover:text-stone-700 font-medium transition-colors"
              >
                Conditions Générales de Vente
              </Link>
              <span>.</span>
            </div>

            {consentError && (
              <p className="mt-4 text-sm text-red-700" role="alert">
                Impossible d’enregistrer votre choix pour le moment. Réessayez.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={acceptEssential}
                className="flex-1 px-5 py-3 border border-stone-300 text-sm font-medium text-stone-700 uppercase tracking-[0.2em] hover:bg-stone-50 hover:border-stone-400 transition-all duration-200"
                aria-label="Refuser les statistiques et conserver les fonctions essentielles"
              >
                Essentiels
              </button>

              <button
                type="button"
                onClick={acceptAll}
                className="flex-1 px-5 py-3 bg-stone-900 text-white text-sm font-medium uppercase tracking-[0.2em] hover:bg-stone-800 hover:shadow-lg transition-all duration-200"
                aria-label="Accepter les statistiques"
              >
                Accepter les statistiques
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    {consent && !showBanner && !LEGAL_PAGES.includes(pathname as (typeof LEGAL_PAGES)[number]) && (
      <button
        type="button"
        onClick={() => setShowBanner(true)}
        className="fixed bottom-4 left-4 z-40 rounded-full border border-stone-300 bg-white/95 px-4 py-2 text-xs text-stone-600 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-900"
      >
        Préférences de confidentialité
      </button>
    )}
    </>
  );
}
