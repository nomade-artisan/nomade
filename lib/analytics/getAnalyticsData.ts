import { supabase } from "@/lib/db";

export async function getAnalyticsData() {
  const [metricsRes, productsRes] = await Promise.all([
    supabase.from("product_daily_metrics").select("*"),
    supabase.from("products").select("id, name, stock"),
  ]);

  const { data: metrics, error } = metricsRes;
  const { data: products, error: productError } = productsRes;

  if (error) throw error;
  if (productError) throw productError;

  // Produits uniques dans les métriques
  const uniqueProductIds = [...new Set(metrics?.map((m) => m.product_id) || [])];

  // KPI globaux (toutes dates confondues)
  const totalViews = metrics?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
  const totalCarts = metrics?.reduce((sum, item) => sum + (item.carts || 0), 0) || 0;
  const totalPurchases = metrics?.reduce((sum, item) => sum + (item.purchases || 0), 0) || 0;

  // Agrégation par product_id
  const aggregatedProducts = uniqueProductIds.map((productId) => {
    const productMetrics = metrics?.filter((m) => String(m.product_id) === String(productId)) || [];
    const product = products?.find((p) => String(p.id) === String(productId));

    return {
      product_id: productId,
      views: productMetrics.reduce((sum, m) => sum + (m.views || 0), 0),
      carts: productMetrics.reduce((sum, m) => sum + (m.carts || 0), 0),
      purchases: productMetrics.reduce((sum, m) => sum + (m.purchases || 0), 0),
      trend_score:
        productMetrics.reduce((sum, m) => sum + (m.trend_score || 0), 0) /
        (productMetrics.length || 1),
      stock: product?.stock ?? 0,
    };
  });

  // Top 5 par trend_score
  const topProducts = [...aggregatedProducts]
    .sort((a, b) => b.trend_score - a.trend_score)
    .slice(0, 5);

  // Tous les produits triés par trend_score
  const trendProducts = [...aggregatedProducts].sort((a, b) => b.trend_score - a.trend_score);

  // Prévision stock
  const stockForecast = [...aggregatedProducts]
    .sort((a, b) => a.stock - b.stock);

  console.log("Produits uniques :", uniqueProductIds.length);
  console.log("Produits agrégés :", aggregatedProducts);

  return {
    metrics: metrics || [],
    totalViews,
    totalCarts,
    totalPurchases,
    totalProducts: uniqueProductIds.length,
    topProducts,
    trendProducts,
    catalogProducts: products || [],
    stockForecast,
  };
}