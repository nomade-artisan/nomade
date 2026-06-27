// ─── Métriques globales ─────────────────────────────
export interface GlobalMetrics {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  averageOrderValue: number;
}

// ─── Prédiction produit (depuis product_predictions + products) ──
export interface ProductPrediction {
  product_id: number;
  product_name: string;
  current_stock: number;
  predicted_sales_7d: number;
  predicted_sales_14d: number;
  predicted_sales_30d: number;
  avg_daily_demand: number;
  days_until_out_of_stock: number | null;
  trend_score: number;
  trend_direction: 'up' | 'down' | 'stable';
  alert_type: string | null;
}

// ─── Alerte ──────────────────────────────────────────
export interface Alert {
  product_id: number;
  alert_type: string;
  message: string;
}

// ─── Réponse complète de l'API analytics ────────────
export interface AnalyticsResponse {
  globalMetrics: GlobalMetrics;
  predictions: ProductPrediction[];
  alerts: Alert[];
}

// ─── Données pour le graphique ──────────────────────
export interface SalesDataPoint {
  date: string; // YYYY-MM-DD
  sales: number;
}