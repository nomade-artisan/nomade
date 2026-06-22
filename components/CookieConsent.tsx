"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("analytics-consent");

    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("analytics-consent", "accepted");
    setShow(false);
  };

  const refuse = () => {
    localStorage.setItem("analytics-consent", "refused");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[420px] bg-white border border-stone-200 rounded-2xl shadow-xl p-5 z-50">
      <h3 className="font-medium mb-2">
        Respect de votre vie privée
      </h3>

      <p className="text-sm text-stone-600 mb-4">
        Nous utilisons des données de navigation anonymisées afin
        d'améliorer nos produits et notre expérience utilisateur.
      </p>

      <div className="flex gap-3">
        <button
          onClick={accept}
          className="px-4 py-2 bg-stone-900 text-white rounded-full text-sm"
        >
          Accepter
        </button>

        <button
          onClick={refuse}
          className="px-4 py-2 border border-stone-300 rounded-full text-sm"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}