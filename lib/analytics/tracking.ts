import { supabase } from "@/lib/db";
import { getVisitorId, getSessionId } from "./visitor";

interface AnalyticsEvent {
  user_id?: string;
  product_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
}

export async function trackEvent(
  eventType: string,
  data: AnalyticsEvent = {}
) {
  try {
    const { error } = await supabase
      .from("analytics_events")
      .insert({
        event_type: eventType,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        ...data,
      });

    if (error) {
      console.error("Analytics error:", error);
    }
  } catch (err) {
    console.error("Tracking failed:", err);
  }
}