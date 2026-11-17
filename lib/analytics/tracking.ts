import { getVisitorId, getSessionId } from "./visitor";

interface AnalyticsEvent {
  user_id?: string;
  product_id?: string;
  page_url?: string;
  metadata?: Record<string, unknown>;
}

type ConsentChoice = "accepted" | "essential";
let consentSyncPromise: Promise<boolean> | null = null;
let consentRequestQueue: Promise<boolean> = Promise.resolve(true);

function hasConsent() {
  if (typeof window === "undefined") return false;

  return localStorage.getItem("analytics-consent") === "accepted";
}

export function getAnalyticsSessionId(): string | null {
  return hasConsent() ? getSessionId() : null;
}

export function updateAnalyticsConsent(consent: ConsentChoice): Promise<boolean> {
  const request = consentRequestQueue
    .catch(() => false)
    .then(() =>
      fetch("/api/analytics/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent }),
      }).then((response) => response.ok)
    )
    .catch(() => false);

  consentRequestQueue = request;
  consentSyncPromise = consent === "accepted" ? request : null;
  return request;
}

async function ensureServerConsent(): Promise<boolean> {
  if (!hasConsent()) return false;

  if (!consentSyncPromise) {
    consentSyncPromise = updateAnalyticsConsent("accepted");
  }

  const synced = await consentSyncPromise;
  if (!synced) consentSyncPromise = null;
  return synced;
}

export async function trackEvent(
  eventType: string,
  data: AnalyticsEvent = {}
) {
  if (!hasConsent()) {
    return;
  }

  try {
    if (!(await ensureServerConsent()) || !hasConsent()) return;

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
