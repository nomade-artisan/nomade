"use client";

import { useEffect } from "react";
import { usePageTracking } from "@/lib/analytics/pageTracking";
import { trackTrafficSource } from "@/lib/analytics/sourceTracking";

export default function AnalyticsTracker() {
  usePageTracking();

  useEffect(() => {
    trackTrafficSource();
    const handleConsentUpdate = (event: Event) => {
      const choice = (event as CustomEvent<{ type?: string }>).detail?.type;
      if (choice === "accepted") trackTrafficSource();
    };

    window.addEventListener("consent-updated", handleConsentUpdate);
    return () => window.removeEventListener("consent-updated", handleConsentUpdate);
  }, []);

  return null;
}
