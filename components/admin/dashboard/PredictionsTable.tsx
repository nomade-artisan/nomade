"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductPrediction } from "@/lib/analytics/types";

export default function PredictionsTable({ predictions }: { predictions: ProductPrediction[] }) {
  if (!predictions.length) return <p>Aucune prédiction disponible.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prédictions de stock</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-2">Produit</th>
              <th className="text-left p-2">Stock</th>
              <th className="text-left p-2">Ventes 7j</th>
              <th className="text-left p-2">Demande/j</th>
              <th className="text-left p-2">Jours restants</th>
              <th className="text-left p-2">Tendance</th>
              <th className="text-left p-2">Alerte</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p) => (
              <tr key={p.product_id} className="border-b hover:bg-muted/50">
                <td className="p-2 font-medium">{p.product_name}</td>
                <td className="p-2">{p.current_stock}</td>
                <td className="p-2">{p.predicted_sales_7d}</td>
                <td className="p-2">{p.avg_daily_demand}</td>
                <td className="p-2">
                  {p.days_until_out_of_stock !== null ? p.days_until_out_of_stock : "—"}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.trend_direction === "up"
                        ? "bg-green-100 text-green-800"
                        : p.trend_direction === "down"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {p.trend_direction === "up" ? "↗" : p.trend_direction === "down" ? "↘" : "→"}
                  </span>
                </td>
                <td className="p-2">
                  {p.alert_type && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                      {p.alert_type}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}