'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ CONSTANTES ============
const CONSENT_KEY = 'analytics-consent';
const LEGAL_PAGES = ['/confidentialite', '/cgv', '/mentions-legales'] as const;

type ConsentType = 'accepted' | 'essential' | null;

// ============ HOOK PERSONNALISÉ ============
function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentType>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentType;
    setConsent(stored);
    if (!stored) setShowBanner(true);
  }, []);

  const acceptAll = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
    setShowBanner(false);
    // Déclenche un événement pour initialiser les analytics
    window.dispatchEvent(new CustomEvent('consent-updated', { detail: { type: 'accepted' } }));
  }, []);

  const acceptEssential = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'essential');
    setConsent('essential');
    setShowBanner(false);
    window.dispatchEvent(new CustomEvent('consent-updated', { detail: { type: 'essential' } }));
  }, []);

  return {
    consent,
    showBanner,
    setShowBanner,
    mounted,
    acceptAll,
    acceptEssential,
  };
}

// ============ COMPOSANT PRINCIPAL ============
export default function CookieConsent() {
  const pathname = usePathname();
  const { showBanner, mounted, acceptAll, acceptEssential } = useCookieConsent();

  // Ne pas afficher sur les pages légales ou avant montage
  if (!mounted || LEGAL_PAGES.includes(pathname as typeof LEGAL_PAGES[number])) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {showBanner && (
        <motion.div
          key="cookie-banner"
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 300,
            duration: 0.3 
          }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[480px] bg-white/95 backdrop-blur-sm border border-stone-200/80 rounded-3xl shadow-2xl p-6 z-50"
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-description"
        >
          {/* ===== EN-TÊTE ===== */}
          <div className="flex items-start justify-between mb-3">
            <h3 
              id="cookie-title" 
              className="text-base font-medium text-stone-900"
            >
             Votre confidentialité
            </h3>
            <button
              onClick={acceptEssential}
              className="text-stone-400 hover:text-stone-600 transition-colors p-1 -mt-1"
              aria-label="Fermer et refuser les cookies non-essentiels"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ===== DESCRIPTION ===== */}
          <p id="cookie-description" className="text-sm text-stone-600 leading-relaxed">
            Nomade utilise des cookies pour assurer le bon fonctionnement
            du site, sécuriser les paiements et analyser l'utilisation de notre
            boutique afin d'améliorer votre expérience.
          </p>

          {/* ===== LIENS LÉGAUX ===== */}
          <div className="text-xs text-stone-500 mt-3 leading-relaxed space-x-1">
            <span>En continuant, vous acceptez notre</span>
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

          {/* ===== BOUTONS ===== */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              onClick={acceptEssential}
              className="flex-1 px-4 py-3 border border-stone-300 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-all duration-200 active:scale-95"
              aria-label="Accepter uniquement les cookies essentiels"
            >
              Uniquement les essentiels
            </button>

            <button
              onClick={acceptAll}
              className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 hover:shadow-lg transition-all duration-200 active:scale-95"
              aria-label="Accepter tous les cookies"
            >
              Accepter tout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}