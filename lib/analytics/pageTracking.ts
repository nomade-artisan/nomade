"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "./tracking";

export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    let pageViewTracked = false;

    const trackCurrentPage = () => {
      if (pageViewTracked || localStorage.getItem("analytics-consent") !== "accepted") return;
      pageViewTracked = true;
      void trackEvent("page_view", {
        page_url: pathname,
        metadata: {
          title: document.title,
          tracking_version: 2,
        },
      });
    };

    const handleConsentUpdate = (event: Event) => {
      const choice = (event as CustomEvent<{ type?: string }>).detail?.type;
      if (choice === "essential") {
        pageViewTracked = false;
      } else if (choice === "accepted") {
        trackCurrentPage();
      }
    };

    trackCurrentPage();
    window.addEventListener("consent-updated", handleConsentUpdate);
    return () => window.removeEventListener("consent-updated", handleConsentUpdate);
  }, [pathname]);
}
