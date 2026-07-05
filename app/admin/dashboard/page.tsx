import {
  getGlobalMetrics,
  getDailySales,
} from "@/lib/analytics/queries";
import MetricsCards from "@/components/admin/dashboard/MetricsCards";
import TrendChart from "@/components/admin/dashboard/TrendChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  // On ne charge plus les prédictions pour l'instant
  const [globalMetrics, dailySales] = await Promise.all([
    getGlobalMetrics(),
    getDailySales(),
  ]);

  // Pas d'alertes de prédictions non plus
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      {/* Bandeau développement */}
      <Alert variant="default" className="border-amber-500 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Module en développement</AlertTitle>
        <AlertDescription className="text-amber-700">
          Les prédictions de stock et les alertes associées seront disponibles prochainement.
        </AlertDescription>
      </Alert>

      <MetricsCards metrics={globalMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder pour les prédictions */}
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <h3 className="text-lg font-semibold mb-2">Prédictions de vente</h3>
          <p>Les prédictions seront affichées ici une fois le module activé.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Tendance des ventes globales</h2>
          <TrendChart data={dailySales} />
        </div>
      </div>
    </div>
  );
}