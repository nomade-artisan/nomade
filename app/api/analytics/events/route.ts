import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const EVENT_TYPES = new Set([
  "page_view",
  "traffic_source",
  "checkout_started",
  "remove_from_cart",
  "search",
  "collection_view",
  "collection_category_click",
  "add_to_cart",
  "product_view",
  "product_time_spent",
]);

const METADATA_KEYS = new Set([
  "title",
  "source",
  "query",
  "product_name",
  "category",
  "collection",
  "cart_items",
  "subtotal",
  "total",
  "seconds",
  "quantity",
  "product_index",
]);

function safeId(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 64) return null;
  return /^[a-zA-Z0-9._,-]+$/.test(value) ? value : null;
}

function safeMetadata(value: unknown): Record<string, string | number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const result: Record<string, string | number> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, 12)) {
    if (!METADATA_KEYS.has(key)) continue;
    if (typeof item === "string") {
      result[key] = item.slice(0, 120);
    } else if (typeof item === "number" && Number.isFinite(item)) {
      result[key] = Math.max(0, Math.min(item, 1_000_000));
    }
  }
  return result;
}

export async function POST(request: NextRequest) {
  const rateLimitError = await enforceRateLimit(request, "analytics-events", {
    windowMs: 60_000,
    maxRequests: 120,
  });
  if (rateLimitError) return rateLimitError;

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8192) {
    return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 8192) {
      return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (typeof body.event_type !== "string" || !EVENT_TYPES.has(body.event_type)) {
    return NextResponse.json({ error: "Événement invalide" }, { status: 400 });
  }

  const rawPageUrl = typeof body.page_url === "string" ? body.page_url : null;
  const pageUrl = rawPageUrl?.startsWith("/") && !rawPageUrl.startsWith("//")
    ? rawPageUrl.split(/[?#]/, 1)[0].slice(0, 256)
    : null;
  const rawProductId = body.product_id;
  const productId = typeof rawProductId === "number" && Number.isSafeInteger(rawProductId)
    ? String(rawProductId)
    : typeof rawProductId === "string" && /^[0-9,]{1,120}$/.test(rawProductId)
      ? rawProductId
      : null;

  const { error } = await supabaseAdmin.from("analytics_events").insert({
    event_type: body.event_type,
    visitor_id: safeId(body.visitor_id),
    session_id: safeId(body.session_id),
    product_id: productId,
    page_url: pageUrl,
    metadata: safeMetadata(body.metadata),
  });

  if (error) {
    console.error("Analytics event insert failed:", error.message);
    return NextResponse.json({ error: "Événement non enregistré" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 202 });
}
