export interface GlobalMetrics {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  averageOrderValue: number;
}

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

export interface Alert {
  product_id: number;
  alert_type: string;
  message: string;
}

export interface AnalyticsResponse {
  globalMetrics: GlobalMetrics;
  predictions: ProductPrediction[];
  alerts: Alert[];
}

export interface SalesDataPoint {
  date: string; // YYYY-MM-DD
  sales: number;
}