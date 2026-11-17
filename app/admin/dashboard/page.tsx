import {
  getGlobalMetrics,
  getDailySales,
  getStockCoverage,
} from "@/lib/analytics/queries";
import MetricsCards from "@/components/admin/dashboard/MetricsCards";
import TrendChart from "@/components/admin/dashboard/TrendChart";
import StockCoverageTable from "@/components/admin/dashboard/StockCoverageTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const [globalMetrics, dailySales, stockCoverage] = await Promise.all([
    getGlobalMetrics(),
    getDailySales(),
    getStockCoverage(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Tableau de bord</h1>

      <Alert variant="default" className="border-amber-500 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Premiers repères d’aide à la décision</AlertTitle>
        <AlertDescription className="text-amber-700">
          La couverture de stock repose sur 30 jours de ventes. Les délais fournisseurs et les coûts d’achat restent à ajouter pour recommander un réassort ou comparer les marges.
        </AlertDescription>
      </Alert>

      <MetricsCards metrics={globalMetrics} />
      <p className="-mt-6 text-sm text-muted-foreground">
        Conversion calculée sur les sessions ayant accepté les statistiques ; les achats sans lien de session sont exclus.
        Le chiffre d’affaires exclut les commandes annulées, retournées et remboursées.
      </p>

      <div className="grid grid-cols-1 gap-8">
        <StockCoverageTable data={stockCoverage} />
        <div>
          <h2 className="text-xl font-semibold mb-4">Tendance des ventes globales</h2>
          <TrendChart data={dailySales} />
        </div>
      </div>
    </div>
  );
}
