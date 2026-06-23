import AnalyticsLayout from "@/components/analytics/AnalyticsLayout";
import AnalyticsNavbar from "@/components/analytics/AnalyticsNavbar";
import AnalyticsSidebar from "@/components/analytics/AnalyticsSidebar";
import AnalyticsStats from "@/components/analytics/AnalyticsStats";
import TopProducts from "@/components/analytics/TopProducts";
import TrendScoreTable from "@/components/analytics/TrendScoreTable";

export default function AnalyticsPage() {
  return (
    <AnalyticsLayout
      sidebar={<AnalyticsSidebar />}
      navbar={<AnalyticsNavbar />}
    >
      <div>
        <AnalyticsStats 
          products={100}
          views={1000}
          carts={100}
          purchases={50}
        />
        <TopProducts 
          products={[
            {
              product_id: "PROD-001",
              views: 100,
              carts: 10,
              purchases: 5,
              trend_score: 4.5
            },
            {
              product_id: "PROD-002",
              views: 80,
              carts: 15,
              purchases: 8,
              trend_score: 4.2
            }
          ]}
        />
        <
            TrendScoreTable
            products={[
                {
                product_id: "Sac Origami",
                trend_score: 92,
                },
                {
                product_id: "Sac Nomade",
                trend_score: 58,
                },
                {
                product_id: "Portefeuille",
                trend_score: 22,
                },
            ]}
        />
      </div>
    </AnalyticsLayout>
  );
}