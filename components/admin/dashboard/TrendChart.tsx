"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SalesDataPoint } from "@/lib/analytics/types";

export default function TrendChart({ data }: { data: SalesDataPoint[] }) {
  if (!data.length) return null;
  console.log("Order items data:", data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes quotidiennes (30 jours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#1c1917" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}