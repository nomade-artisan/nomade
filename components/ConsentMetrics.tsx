"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const CONSENT_KEY = "analytics-consent";

export default function ConsentMetrics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setEnabled(localStorage.getItem(CONSENT_KEY) === "accepted");
    };

    syncConsent();
    window.addEventListener("consent-updated", syncConsent);
    return () => window.removeEventListener("consent-updated", syncConsent);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
