import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  addCalendarDays,
  getDateKeyInTimeZone,
  getDateRangeUtc,
} from "@/lib/analytics/dates";
import type { GlobalMetrics, ProductPrediction, SalesDataPoint, StockCoverage } from "./types";

const PAGE_SIZE = 1000;
const PAID_ORDER_STATUSES = ["confirmed", "preparing", "shipped", "delivered"];

function calendarDaysBetween(startDate: string, endDate: string): number {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.floor((end - start) / 86_400_000) + 1;
}

type PagedQueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
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

export async function getGlobalMetrics(): Promise<GlobalMetrics> {
  const today = getDateKeyInTimeZone(new Date());
  const { start } = getDateRangeUtc(addCalendarDays(today, -29));
  const { end } = getDateRangeUtc(today);

  const orders = await readAllPages<{ id: string; total: number | null }>((from, to) =>
    supabaseAdmin
      .from("orders")
      .select("id, total, created_at")
      .in("status", PAID_ORDER_STATUSES)
      .is("refunded_at", null)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to)
  );

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = orders.length;
  const eligibleOrderIds = new Set(orders.map((order) => String(order.id)));

  const [pageViews, purchaseEvents] = await Promise.all([
    readAllPages<{
      id: string;
      session_id: string | null;
      metadata: Record<string, unknown> | null;
    }>((from, to) =>
      supabaseAdmin
        .from("analytics_events")
        .select("id, session_id, metadata")
        .eq("event_type", "page_view")
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    ),
    readAllPages<{
      id: string;
      metadata: Record<string, unknown> | null;
    }>((from, to) =>
      supabaseAdmin
        .from("analytics_events")
        .select("id, metadata")
        .eq("event_type", "purchase_completed")
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    ),
  ]);

  const measuredSessions = new Set(
    pageViews
      .filter((event) => event.metadata?.tracking_version === 2)
      .map((event) => event.session_id)
      .filter((sessionId): sessionId is string => Boolean(sessionId))
  );
  const convertedSessions = new Set<string>();
  for (const event of purchaseEvents) {
    const sessionId = event.metadata?.analytics_session_id;
    const orderId = event.metadata?.order_id;
    if (
      typeof sessionId === "string" &&
      typeof orderId === "string" &&
      eligibleOrderIds.has(orderId) &&
      measuredSessions.has(sessionId)
    ) {
      convertedSessions.add(sessionId);
    }
  }

  const conversionRate = measuredSessions.size
    ? (convertedSessions.size / measuredSessions.size) * 100
    : 0;
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    conversionRate: Math.round(conversionRate * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
  };
}

export async function getLatestPredictions(): Promise<ProductPrediction[]> {
  // Sous-requête pour obtenir la dernière date de prédiction par produit
  const { data: latestPredictions, error: predError } = await supabaseAdmin
    .from("product_predictions")
    .select("product_id, prediction_date")
    .order("prediction_date", { ascending: false });

  if (predError) {
    if (predError.code === "42P01" || predError.code === "PGRST205") return [];
    throw predError;
  }

  // Obtenir la date la plus récente par produit
  const latestDates = new Map<number, string>();
  for (const p of latestPredictions || []) {
    if (!latestDates.has(p.product_id)) {
      latestDates.set(p.product_id, p.prediction_date);
    }
  }

  // Récupérer les prédictions correspondantes avec jointure products
  const productIds = Array.from(latestDates.keys());
  if (productIds.length === 0) return [];

  const { data: predictions, error: predError2 } = await supabaseAdmin
    .from("product_predictions")
    .select(`
      product_id,
      predicted_sales_7d,
      predicted_sales_14d,
      predicted_sales_30d,
      avg_daily_demand,
      days_until_out_of_stock,
      trend_score,
      trend_direction,
      alert_type,
      products!inner(id, name, stock)
    `)
    .in("product_id", productIds)
    .in("prediction_date", Array.from(latestDates.values()));

  if (predError2) {
    if (predError2.code === "42P01" || predError2.code === "PGRST205") return [];
    throw predError2;
  }

  return (predictions || []).map((p: any) => ({
    product_id: p.product_id,
    product_name: p.products.name,
    current_stock: p.products.stock,
    predicted_sales_7d: p.predicted_sales_7d,
    predicted_sales_14d: p.predicted_sales_14d,
    predicted_sales_30d: p.predicted_sales_30d,
    avg_daily_demand: p.avg_daily_demand,
    days_until_out_of_stock: p.days_until_out_of_stock,
    trend_score: p.trend_score,
    trend_direction: p.trend_direction,
    alert_type: p.alert_type,
  }));
}

export async function getDailySales(): Promise<SalesDataPoint[]> {
  const today = getDateKeyInTimeZone(new Date());
  const firstDate = addCalendarDays(today, -29);
  const { start } = getDateRangeUtc(firstDate);
  const { end } = getDateRangeUtc(today);
  const orders = await readAllPages<{ total: number | null; created_at: string }>((from, to) =>
    supabaseAdmin
      .from("orders")
      .select("total, created_at")
      .in("status", PAID_ORDER_STATUSES)
      .is("refunded_at", null)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to)
  );

  const salesByDate = new Map<string, number>();
  for (const order of orders || []) {
    const date = getDateKeyInTimeZone(new Date(order.created_at));
    salesByDate.set(date, (salesByDate.get(date) || 0) + Number(order.total || 0));
  }

  const result: SalesDataPoint[] = [];
  for (let i = 0; i < 30; i++) {
    const dateStr = addCalendarDays(firstDate, i);
    result.push({
      date: dateStr,
      sales: salesByDate.get(dateStr) || 0,
    });
  }
  return result;
}

export async function getStockCoverage(): Promise<StockCoverage[]> {
  const today = getDateKeyInTimeZone(new Date());
  const lastCompleteDate = addCalendarDays(today, -1);
  const firstDate = addCalendarDays(lastCompleteDate, -29);
  const { start } = getDateRangeUtc(firstDate);
  const { end } = getDateRangeUtc(lastCompleteDate);

  const [products, orders] = await Promise.all([
    readAllPages<{ id: number; name: string; stock: number | null; created_at: string }>((from, to) =>
      supabaseAdmin
        .from("products")
        .select("id, name, stock, created_at")
        .eq("status", "active")
        .order("id", { ascending: true })
        .range(from, to)
    ),
    readAllPages<{ id: string; created_at: string }>((from, to) =>
      supabaseAdmin
        .from("orders")
        .select("id, created_at")
        .in("status", PAID_ORDER_STATUSES)
        .is("refunded_at", null)
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    ),
  ]);

  const orderItems: Array<{ product_id: number; quantity: number | null }> = [];
  const orderIds = orders.map((order) => order.id);
  for (let index = 0; index < orderIds.length; index += 100) {
    const batch = orderIds.slice(index, index + 100);
    const items = await readAllPages<{ product_id: number; quantity: number | null }>((from, to) =>
      supabaseAdmin
        .from("order_items")
        .select("id, product_id, quantity, created_at")
        .in("order_id", batch)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
    );
    orderItems.push(...items);
  }

  const unitsSold = new Map<number, number>();
  for (const item of orderItems) {
    const quantity = Math.max(0, Math.floor(Number(item.quantity || 0)));
    unitsSold.set(item.product_id, (unitsSold.get(item.product_id) || 0) + quantity);
  }

  const firstOrderDate = orders.length > 0
    ? getDateKeyInTimeZone(new Date(orders[0].created_at))
    : null;

  return products
    .map((product) => {
      const sold = unitsSold.get(product.id) || 0;
      const productCreatedDate = getDateKeyInTimeZone(new Date(product.created_at));
      const observationStart = [firstDate, firstOrderDate, productCreatedDate]
        .filter((date): date is string => Boolean(date))
        .sort()
        .slice(-1)[0];
      const observedDays = orders.length > 0
        ? Math.min(30, Math.max(0, calendarDaysBetween(observationStart, lastCompleteDate)))
        : 0;
      const averageDailyUnits = observedDays > 0 ? sold / observedDays : 0;
      const currentStock = Math.max(0, Number(product.stock || 0));

      return {
        product_id: product.id,
        product_name: product.name,
        current_stock: currentStock,
        units_sold_30d: sold,
        observed_days: observedDays,
        average_daily_units: averageDailyUnits,
        estimated_stock_days: averageDailyUnits > 0 ? currentStock / averageDailyUnits : null,
      };
    })
    .sort((a, b) => {
      if (a.estimated_stock_days === null) return b.estimated_stock_days === null ? 0 : 1;
      if (b.estimated_stock_days === null) return -1;
      return a.estimated_stock_days - b.estimated_stock_days;
    });
}

export function generateAlerts(predictions: ProductPrediction[]): any[] {
  const alerts: any[] = [];
  for (const p of predictions) {
    if (p.alert_type === "rupture_imminente" && p.days_until_out_of_stock !== null && p.days_until_out_of_stock <= 7) {
      alerts.push({
        product_id: p.product_id,
        alert_type: p.alert_type,
        message: `Rupture imminente dans ${p.days_until_out_of_stock} jours`,
      });
    } else if (p.alert_type === "opportunité_réassort") {
      alerts.push({
        product_id: p.product_id,
        alert_type: p.alert_type,
        message: "Tendance haussière, opportunité de réassort",
      });
    }
  }
  return alerts;
}
