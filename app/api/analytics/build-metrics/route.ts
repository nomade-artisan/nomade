import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminAuthorization } from "@/lib/security/admin-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  addCalendarDays,
  ANALYTICS_TIME_ZONE,
  getDateKeyInTimeZone,
  getDateRangeUtc,
  isDateKey,
} from "@/lib/analytics/dates";

const PAGE_SIZE = 1000;
const PAID_ORDER_STATUSES = ["confirmed", "preparing", "shipped", "delivered"];
const ORDER_ID_BATCH_SIZE = 100;

type PagedQueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

type DailyOrder = {
  id: string;
  total: number | null;
  discount_amount: number | null;
  promo_code: string | null;
};

type DailyOrderItem = {
  id: string;
  order_id: string;
  product_id: number | string;
  quantity: number | null;
  total: number | null;
};

type DailyEvent = {
  id: string;
  event_type: string;
  product_id: string | number | null;
  metadata: Record<string, unknown> | null;
};

type ProductStats = {
  views: number;
  carts: number;
  purchases: number;
  totalTime: number;
  timeCount: number;
};

async function readAllPages<T>(
  makePage: (from: number, to: number) => PromiseLike<PagedQueryResult<T>>
): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await makePage(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);

    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

function normalizeProductIds(rawValue: string | number | null | undefined): string[] {
  if (rawValue == null || rawValue === "") return [];

  return String(rawValue)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

async function getDailyContext(metricDate: string, start: string, end: string) {
  const orders = await readAllPages<DailyOrder>((from, to) =>
    supabaseAdmin
      .from("orders")
      .select("id, total, discount_amount, promo_code")
      .in("status", PAID_ORDER_STATUSES)
      .is("refunded_at", null)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to)
  );

  const orderMap = new Map(orders.map((order) => [String(order.id), order]));
  const orderIds = orders.map((order) => String(order.id));
  const orderItems: DailyOrderItem[] = [];

  for (let index = 0; index < orderIds.length; index += ORDER_ID_BATCH_SIZE) {
    const batch = orderIds.slice(index, index + ORDER_ID_BATCH_SIZE);
    const items = await readAllPages<DailyOrderItem>((from, to) =>
      supabaseAdmin
        .from("order_items")
        .select("id, order_id, product_id, quantity, total")
        .in("order_id", batch)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    );
    orderItems.push(...items);
  }

  const itemsByOrder = new Map<string, DailyOrderItem[]>();
  for (const item of orderItems) {
    const items = itemsByOrder.get(String(item.order_id)) ?? [];
    items.push(item);
    itemsByOrder.set(String(item.order_id), items);
  }

  const productRevenue = new Map<string, number>();
  const productDiscount = new Map<string, number>();
  const productPromoFlag = new Map<string, number>();
  const productPurchases = new Map<string, number>();

  for (const [orderId, items] of itemsByOrder) {
    const order = orderMap.get(orderId);
    if (!order) continue;

    const merchandiseTotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
    for (const item of items) {
      const productId = String(item.product_id);
      const itemRevenue = Number(item.total || 0);
      const itemDiscount = merchandiseTotal > 0
        ? Number(order.discount_amount || 0) * (itemRevenue / merchandiseTotal)
        : 0;

      productRevenue.set(productId, (productRevenue.get(productId) || 0) + itemRevenue);
      productDiscount.set(productId, (productDiscount.get(productId) || 0) + itemDiscount);
      // Conserve le sens historique de `purchases` : commandes contenant le produit.
      // Les unités vendues (quantité) sont suivies séparément dans l'analyse de stock.
      productPurchases.set(productId, (productPurchases.get(productId) || 0) + 1);

      if (order.promo_code || Number(order.discount_amount || 0) > 0) {
        productPromoFlag.set(productId, 1);
      }
    }
  }

  const totalRevenue = Array.from(productRevenue.values()).reduce((sum, value) => sum + value, 0);
  const totalDiscount = orders.reduce((sum, order) => sum + Number(order.discount_amount || 0), 0);
  let projectAdSpend = 0;
  for (const tableName of ["marketing_spend", "daily_ad_spend", "campaign_daily_spend", "marketing_daily_spend", "ad_spend_daily"]) {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select("date, ad_spend, spend, amount")
      .or(`date.eq.${metricDate},metric_date.eq.${metricDate}`)
      .limit(100);

    if (!error && data) {
      for (const row of data) {
        const value = Number(row.ad_spend ?? row.spend ?? row.amount ?? 0);
        if (Number.isFinite(value)) projectAdSpend += value;
      }
    }
  }

  return {
    orders,
    productRevenue,
    productDiscount,
    productPromoFlag,
    productPurchases,
    totalRevenue,
    totalDiscount,
    projectAdSpend,
  };
}

function getPreviousBusinessDate(): string {
  return addCalendarDays(getDateKeyInTimeZone(new Date()), -1);
}

function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const cronAuthorized = isCronAuthorized(request);

  if (authorization?.startsWith("Bearer ") && !cronAuthorized) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  if (!cronAuthorized) {
    const authError = requireAdminAuthorization(request);
    if (authError) return authError;
  }

  const rateLimitError = await enforceRateLimit(request, "build-metrics", {
    windowMs: 60_000,
    maxRequests: 5,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const today = getDateKeyInTimeZone(new Date());
    const requestedDate = new URL(request.url).searchParams.get("date");
    const metricDate = requestedDate || getPreviousBusinessDate();

    if (!isDateKey(metricDate) || metricDate > today) {
      return NextResponse.json(
        { error: "La date doit être une date valide, au format AAAA-MM-JJ, qui n'est pas dans le futur." },
        { status: 400 }
      );
    }

    const { start, end } = getDateRangeUtc(metricDate, ANALYTICS_TIME_ZONE);
    const context = await getDailyContext(metricDate, start, end);

    const events = await readAllPages<DailyEvent>((from, to) =>
      supabaseAdmin
        .from("analytics_events")
        .select("id, event_type, product_id, metadata")
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    );

    const activeProducts = await readAllPages<{ id: number | string }>((from, to) =>
      supabaseAdmin
        .from("products")
        .select("id")
        .eq("status", "active")
        .order("id", { ascending: true })
        .range(from, to)
    );

    const productIds = new Set<string>([
      ...activeProducts.map((product) => String(product.id)),
      ...context.productRevenue.keys(),
    ]);
    const productStats = new Map<string, ProductStats>();

    const getStats = (productId: string) => {
      if (!productStats.has(productId)) {
        productStats.set(productId, {
          views: 0,
          carts: 0,
          purchases: context.productPurchases.get(productId) || 0,
          totalTime: 0,
          timeCount: 0,
        });
      }
      return productStats.get(productId)!;
    };

    for (const productId of productIds) getStats(productId);

    for (const event of events) {
      for (const productId of normalizeProductIds(event.product_id)) {
        const stats = getStats(productId);
        productIds.add(productId);

        switch (event.event_type) {
          case "product_view":
            stats.views++;
            break;
          case "add_to_cart":
            stats.carts++;
            break;
          case "product_time_spent": {
            const seconds = Number(event.metadata?.seconds || 0);
            if (Number.isFinite(seconds) && seconds > 0) {
              stats.totalTime += seconds;
              stats.timeCount++;
            }
            break;
          }
        }
      }
    }

    const totalProductRevenue = context.totalRevenue;
    const metricRows = Array.from(productIds, (productId) => {
      const stats = getStats(productId);
      const avgTime = stats.timeCount > 0 ? stats.totalTime / stats.timeCount : 0;
      // Score d'activité quotidien ; le temps passé reste un indicateur distinct en secondes.
      const trendScore = stats.views * 0.1 + stats.carts * 0.3 + stats.purchases * 0.4;
      const productRevenue = Number(context.productRevenue.get(productId) || 0);
      const productDiscount = Number(context.productDiscount.get(productId) || 0);
      const promoFlag = context.productPromoFlag.get(productId) === 1 ? 1 : 0;
      const discountPercent = productRevenue > 0 ? (productDiscount / productRevenue) * 100 : 0;
      const adSpend = totalProductRevenue > 0 && context.projectAdSpend > 0
        ? context.projectAdSpend * (productRevenue / totalProductRevenue)
        : 0;

      return {
        metric_date: metricDate,
        product_id: productId,
        views: stats.views,
        carts: stats.carts,
        purchases: stats.purchases,
        avg_time_spent: avgTime,
        trend_score: trendScore,
        promo_flag: promoFlag,
        discount_percent: discountPercent,
        ad_spend: adSpend,
      };
    });

    const UPSERT_BATCH_SIZE = 500;
    for (let index = 0; index < metricRows.length; index += UPSERT_BATCH_SIZE) {
      const { error } = await supabaseAdmin
        .from("product_daily_metrics")
        .upsert(
          metricRows.slice(index, index + UPSERT_BATCH_SIZE),
          { onConflict: "metric_date, product_id" }
        );

      if (error) {
        console.error("product_daily_metrics upsert failed", {
          metricDate,
          batchStart: index,
          error: error.message,
        });
        return NextResponse.json({ error: "metrics_write_failed" }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      metric_date: metricDate,
      timezone: ANALYTICS_TIME_ZONE,
      events_processed: events.length,
      paid_orders_processed: context.orders.length,
      products_processed: metricRows.length,
      project_context: {
        totalRevenue: context.totalRevenue,
        totalDiscount: context.totalDiscount,
        projectAdSpend: context.projectAdSpend,
      },
    });
  } catch (error) {
    console.error("build-metrics failed", error);
    return NextResponse.json(
      {
        error: "metrics_generation_failed",
        details: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 }
    );
  }
}
