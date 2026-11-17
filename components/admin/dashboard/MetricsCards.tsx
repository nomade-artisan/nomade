"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalMetrics } from "@/lib/analytics/types";

export default function MetricsCards({ metrics }: { metrics: GlobalMetrics }) {
  const cards = [
    { title: "Chiffre d'affaires", value: `${metrics.totalRevenue.toFixed(0)} €` },
    { title: "Commandes", value: metrics.totalOrders },
    { title: "Conversion mesurée", value: `${metrics.conversionRate} %` },
    { title: "Panier moyen", value: `${metrics.averageOrderValue} €` },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title} className="min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-words text-2xl font-light sm:text-3xl">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
