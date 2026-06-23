import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*");

    if (error) {
      throw error;
    }

    const products = new Map();

    for (const event of events || []) {
      const productId = event.product_id;

      if (!productId) continue;

      if (!products.has(productId)) {
        products.set(productId, {
          views: 0,
          carts: 0,
          purchases: 0,
          totalTime: 0,
          timeCount: 0,
        });
      }

      const stats = products.get(productId);

      switch (event.event_type) {
        case "product_view":
          stats.views++;
          break;

        case "add_to_cart":
          stats.carts++;
          break;

        case "purchase_completed":
          stats.purchases++;
          break;

        case "product_time_spent":
          stats.totalTime += Number(
            event.metadata?.seconds || 0
          );
          stats.timeCount++;
          break;
      }
    }

    let generated = 0;

    for (const [productId, stats] of products) {
      const avgTime =
        stats.timeCount > 0
          ? stats.totalTime / stats.timeCount
          : 0;

      const trendScore =
        stats.views * 0.1 +
        stats.carts * 0.3 +
        stats.purchases * 0.4 +
        avgTime * 0.2;

      await supabase
        .from("product_daily_metrics")
        .upsert({
          metric_date: today,
          product_id: productId,
          views: stats.views,
          carts: stats.carts,
          purchases: stats.purchases,
          avg_time_spent: avgTime,
          trend_score: trendScore,
        });

      generated++;
    }

    return NextResponse.json({
      success: true,
      products_processed: generated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "metrics_generation_failed",
      },
      { status: 500 }
    );
  }
}