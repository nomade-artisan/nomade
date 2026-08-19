import { supabase } from "@/lib/supabase/client";
import { getVisitorId, getSessionId } from "./visitor";

interface AnalyticsEvent {
  user_id?: string;
  product_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
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

    const { error } = await supabase.from("analytics_events").insert(payload);

    if (error) {
      const message = String(error.message ?? "Unknown analytics insert error");
      const isRlsOrPermissionIssue =
        /row-level security|permission denied|policy|unauthorized/i.test(message) ||
        /row-level security|permission denied|policy|unauthorized/i.test(String(error.details ?? "")) ||
        /row-level security|permission denied|policy|unauthorized/i.test(String(error.hint ?? ""));

      console.error("Analytics insert failed:", {
        eventType,
        message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        payload,
        isRlsOrPermissionIssue,
      });

      if (isRlsOrPermissionIssue) {
        console.warn(
          "DB write may be blocked by Supabase RLS or table permissions for analytics_events."
        );
      }
    }
  } catch (err) {
    console.error("Tracking failed:", err);
  }
}