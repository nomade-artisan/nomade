import { trackEvent } from "./tracking";

export function trackTrafficSource() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("analytics-consent") !== "accepted") return;

  const alreadyTracked =
    sessionStorage.getItem("traffic-source-tracked");

  if (alreadyTracked) return;

  let source = "direct";

  if (document.referrer.includes("google")) {
    source = "google";
  } else if (document.referrer.includes("instagram")) {
    source = "instagram";
  } else if (document.referrer.includes("facebook")) {
    source = "facebook";
  } else if (document.referrer.includes("linkedin")) {
    source = "linkedin";
  }

  trackEvent("traffic_source", {
    metadata: {
      source,
    },
  });

  sessionStorage.setItem(
    "traffic-source-tracked",
    "true"
  );
}
