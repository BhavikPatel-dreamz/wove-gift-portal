import BrandAnalyticsTable from "../../../../components/orders/BrandAnalyticsTable";
import { fetchBrandAnalytics } from "../../../../lib/action/analytics";

export default async function SettlementsPage({ searchParams }) {
  // Await searchParams
  const resolvedSearchParams = await searchParams;
  
  // Get period from query params, default to 'year'
  const period = resolvedSearchParams?.period || "year";

  // Fetch brand analytics data on server side
  const analyticsData = await fetchBrandAnalytics(period);

  return (
    <div>
      <BrandAnalyticsTable 
        initialBrands={analyticsData.data || []}
        initialSummary={analyticsData.summary || {}}
        initialPeriod={analyticsData.period}
      />
    </div>
  );
}