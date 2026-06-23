import { supabase } from "@/lib/db";

export async function getAnalyticsData() {
  // Metrics
  const { data: metrics, error } = await supabase
    .from("product_daily_metrics")
    .select("*");

  if (error) {
    throw error;
  }

  // Produits
  const {
    data: products,
    error: productError,
  } = await supabase
    .from("products")
    .select("id, name, stock");

  if (productError) {
    throw productError;
  }

  // KPI globaux
  const totalViews =
    metrics?.reduce(
      (sum, item) => sum + (item.views || 0),
      0
    ) || 0;

  const totalCarts =
    metrics?.reduce(
      (sum, item) => sum + (item.carts || 0),
      0
    ) || 0;

  const totalPurchases =
    metrics?.reduce(
      (sum, item) => sum + (item.purchases || 0),
      0
    ) || 0;

  // Top produits
  const topProducts = [...(metrics || [])]
    .sort(
      (a, b) =>
        (b.trend_score || 0) -
        (a.trend_score || 0)
    )
    .slice(0, 5);

  // Tendances
  const trendProducts = [...(metrics || [])].sort(
    (a, b) =>
      (b.trend_score || 0) -
      (a.trend_score || 0)
  );
console.log(products);
console.log(metrics);
  // Prévision stock
  const stockForecast = (products || [])
    .map((product) => {
      const metric = metrics?.find(
        (m) =>
          String(m.product_id) ===
          String(product.id)
      );

      return {
        product_id: product.name,
        stock: product.stock ?? 0,
        purchases: metric?.purchases ?? 0,
      };
    })
    .sort((a, b) => a.stock - b.stock);

  return {
    metrics: metrics || [],

    totalViews,
    totalCarts,
    totalPurchases,
    totalProducts: metrics?.length || 0,

    topProducts,
    trendProducts,

    catalogProducts: products || [],

    stockForecast,
  };
}