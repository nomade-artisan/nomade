import { trackEvent } from "./tracking";

export function trackTrafficSource() {
  if (typeof window === "undefined") return;

  const alreadyTracked =
    sessionStorage.getItem("traffic-source-tracked");

  if (alreadyTracked) return;

  const referrer = document.referrer;

  let source = "direct";

  if (referrer.includes("google")) {
    source = "google";
  } else if (referrer.includes("instagram")) {
    source = "instagram";
  } else if (referrer.includes("facebook")) {
    source = "facebook";
  } else if (referrer.includes("linkedin")) {
    source = "linkedin";
  }

  trackEvent("traffic_source", {
    metadata: {
      source,
      referrer,
    },
  });

  sessionStorage.setItem(
    "traffic-source-tracked",
    "true"
  );
}