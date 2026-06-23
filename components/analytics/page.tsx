import AnalyticsLayout from "@/components/analytics/AnalyticsLayout";
import AnalyticsNavbar from "@/components/analytics/AnalyticsNavbar";
import AnalyticsSidebar from "@/components/analytics/AnalyticsSidebar";

export default function AnalyticsPage() {
  return (
    <AnalyticsLayout
      sidebar={<AnalyticsSidebar />}
      navbar={<AnalyticsNavbar />}
    >
      <div>
        Dashboard Analytics
      </div>
    </AnalyticsLayout>
  );
}