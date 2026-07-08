"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalMetrics } from "@/lib/analytics/types";

export default function MetricsCards({ metrics }: { metrics: GlobalMetrics }) {
  const cards = [
    { title: "Chiffre d'affaires", value: `${metrics.totalRevenue.toFixed(0)} €` },
    { title: "Commandes", value: metrics.totalOrders },
    { title: "Conversion", value: `${metrics.conversionRate} %` },
    { title: "Panier moyen", value: `${metrics.averageOrderValue} €` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-light">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}