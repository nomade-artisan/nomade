"use client";

import Link from "next/link";
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

const essential = () => {
    localStorage.setItem("analytics-consent", "essential");
    setShow(false);
};

if (!show) return null;

return ( 
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[460px] bg-white border border-stone-200 rounded-3xl shadow-xl p-6 z-50"> 
        <h3 className="text-base font-medium text-stone-900 mb-3">Votre confidentialité </h3>


    <p className="text-sm text-stone-600 leading-relaxed">
        Nomade Artisan utilise des cookies pour assurer le bon fonctionnement
        du site, sécuriser les paiements et analyser l'utilisation de notre
        boutique afin d'améliorer votre expérience.
    </p>

    <p className="text-xs text-stone-500 mt-3 leading-relaxed">
        En continuant, vous acceptez notre{" "}
        <Link
        href="/confidentialite"
        className="underline underline-offset-2 hover:text-stone-700"
        >
        Politique de confidentialité
        </Link>{" "}
        et nos{" "}
        <Link
        href="/cgv"
        className="underline underline-offset-2 hover:text-stone-700"
        >
        Conditions Générales de Vente
        </Link>.
    </p>

    <div className="flex gap-3 mt-6">
        <button
        onClick={essential}
        className="flex-1 px-4 py-3 border border-stone-300 rounded-full text-sm font-light hover:bg-stone-50 transition-colors"
        >
        Uniquement les essentiels
        </button>

        <button
        onClick={accept}
        className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-full text-sm font-light hover:bg-stone-800 transition-colors"
        >
        Accepter tout
        </button>
    </div>
</div>

);
}
