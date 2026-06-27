import { NextResponse } from "next/server";
import {
  getGlobalMetrics,
  getLatestPredictions,
  getDailySales,
  generateAlerts,
} from "@/lib/analytics/queries";

export async function GET() {
  try {
    const [globalMetrics, predictions, dailySales] = await Promise.all([
      getGlobalMetrics(),
      getLatestPredictions(),
      getDailySales(),
    ]);

    const alerts = generateAlerts(predictions);

    return NextResponse.json({
      globalMetrics,
      predictions,
      alerts,
      dailySales, // pour le graphique
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}