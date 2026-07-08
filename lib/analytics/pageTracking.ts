"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "./tracking";

export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", {
      page_url: pathname,
      metadata: {
        title: document.title,
      },
    });
  }, [pathname]);
}