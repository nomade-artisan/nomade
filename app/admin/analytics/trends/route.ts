// app/admin/analytics/trends/route.ts
import { NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/analytics/getAnalyticsData";

export async function GET() {
  try {
    const data = await getAnalyticsData();

    return NextResponse.json({
      success: true,
      data: {
        totalViews: data.totalViews,
        totalCarts: data.totalCarts,
        totalPurchases: data.totalPurchases,
        totalProducts: data.totalProducts,
        topProducts: data.topProducts,
        trendProducts: data.trendProducts,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}

