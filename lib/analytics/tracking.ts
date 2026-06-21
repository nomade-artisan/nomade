import { supabase } from "@/lib/db";

interface AnalyticsEvent {
  user_id?: string;
  product_id?: string;
  session_id?: string;
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
        ...data,
      });

    if (error) {
      console.error("Analytics error:", error);
    }
  } catch (err) {
    console.error("Tracking failed:", err);
  }
}