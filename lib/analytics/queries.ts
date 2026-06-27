import { supabase } from "@/lib/db";
import type { GlobalMetrics, ProductPrediction, SalesDataPoint } from "./types";

// ─── Métriques globales (30 jours) ──────────────────
export async function getGlobalMetrics(): Promise<GlobalMetrics> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // CA et commandes
  const { data: orders, error } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", thirtyDaysAgo)
    .not("status", "eq", "cancelled");

  if (error) throw error;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;

  // Visites (à adapter selon ton tracking)
  const { count: visits } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "page_view")
    .gte("created_at", thirtyDaysAgo);

  const conversionRate = visits ? (totalOrders / visits) * 100 : 0;
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    conversionRate: Math.round(conversionRate * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
  };
}

// ─── Prédictions les plus récentes par produit ──────
export async function getLatestPredictions(): Promise<ProductPrediction[]> {
  // Sous-requête pour obtenir la dernière date de prédiction par produit
  const { data, error } = await supabase
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
    .order("prediction_date", { ascending: false })
    .limit(1, { foreignTable: "products" }); // à affiner, voir ci-dessous

  // La requête ci-dessus n'est pas optimale. On utilise une approche plus robuste :
  // 1. Récupérer les dernières prédictions via une sous-requête
  const { data: latestPredictions, error: predError } = await supabase
    .from("product_predictions")
    .select("product_id, prediction_date")
    .order("prediction_date", { ascending: false });

  if (predError) throw predError;

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

  const { data: predictions, error: predError2 } = await supabase
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

  if (predError2) throw predError2;

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

// ─── Données de ventes quotidiennes (30 jours) ──────
export async function getDailySales(): Promise<SalesDataPoint[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("order_items")
    .select("quantity, order:orders!inner(created_at)")
    .gte("order.created_at", thirtyDaysAgo)
    .not("order.status", "eq", "cancelled");

  if (error) throw error;

  // Agréger par jour
  const salesByDate = new Map<string, number>();
  for (const item of data || []) {
    const date = (item.order as any).created_at.split("T")[0];
    salesByDate.set(date, (salesByDate.get(date) || 0) + item.quantity);
  }

  // Remplir les jours sans vente
  const result: SalesDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      sales: salesByDate.get(dateStr) || 0,
    });
  }
  return result;
}

// ─── Alertes générées à partir des prédictions ──────
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