import AnalyticsLayout from "@/components/analytics/AnalyticsLayout";
import AnalyticsNavbar from "@/components/analytics/AnalyticsNavbar";
import AnalyticsSidebar from "@/components/analytics/AnalyticsSidebar";
import AnalyticsStats from "@/components/analytics/AnalyticsStats";
import TopProducts from "@/components/analytics/TopProducts";
import TrendScoreTable from "@/components/analytics/TrendScoreTable";
import StockForecast from "@/components/analytics/StockForecast";

import { getAnalyticsData } from "@/lib/analytics/getAnalyticsData";

export default async function AnalyticsPage() {
  const analytics = await getAnalyticsData();

  return (
    <AnalyticsLayout
      sidebar={<AnalyticsSidebar />}
      navbar={<AnalyticsNavbar />}
    >
      <AnalyticsStats
        products={analytics.totalProducts}
        views={analytics.totalViews}
        carts={analytics.totalCarts}
        purchases={analytics.totalPurchases}
      />

      <div className="grid xl:grid-cols-2 gap-8 mt-8">
        <TopProducts
          products={analytics.topProducts}
        />

        <TrendScoreTable
          products={analytics.trendProducts}
        />
      </div>

      <div className="mt-8">
        <StockForecast
          products={analytics.stockForecast}
        />
      </div>
    </AnalyticsLayout>
  );
}