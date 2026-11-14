import { getVisitorId, getSessionId } from "./visitor";

interface AnalyticsEvent {
  user_id?: string;
  product_id?: string;
  page_url?: string;
  metadata?: Record<string, unknown>;
}

function hasConsent() {
  if (typeof window === "undefined") return false;

  return localStorage.getItem("analytics-consent") === "accepted";
}

export async function trackEvent(
  eventType: string,
  data: AnalyticsEvent = {}
) {
  if (!hasConsent()) {
    return;
  }

  try {
    const payload = {
      event_type: eventType,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      ...data,
    };

    const response = await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!response.ok) {
      console.warn("Analytics event not accepted:", eventType, response.status);
    }
  } catch (err) {
    console.error("Tracking failed:", err);
  }
}
