"use client";

import { useEffect } from "react";
import { usePageTracking } from "@/lib/analytics/pageTracking";
import { trackTrafficSource } from "@/lib/analytics/sourceTracking";

export default function AnalyticsTracker() {
  usePageTracking();

  useEffect(() => {
    trackTrafficSource();
  }, []);

  return null;
}