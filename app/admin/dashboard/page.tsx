import {
  getGlobalMetrics,
  getLatestPredictions,
  getDailySales,
  generateAlerts,
} from "@/lib/analytics/queries";
import MetricsCards from "@/components/admin/dashboard/MetricsCards";
import PredictionsTable from "@/components/admin/dashboard/PredictionsTable";
import TrendChart from "@/components/admin/dashboard/TrendChart";

export default async function DashboardPage() {
  const [globalMetrics, predictions, dailySales] = await Promise.all([
    getGlobalMetrics(),
    getLatestPredictions(),
    getDailySales(),
  ]);

  const alerts = generateAlerts(predictions);

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <MetricsCards metrics={globalMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PredictionsTable predictions={predictions} />
        <TrendChart data={dailySales} />
      </div>

      {alerts.length > 0 && (
        <div className="bg-destructive/10 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Alertes</h3>
          <ul className="list-disc pl-5">
            {alerts.map((a, i) => (
              <li key={i}>
                <strong>{a.product_id}</strong>: {a.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}