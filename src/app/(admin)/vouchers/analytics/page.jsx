import AnalyticsTracking from "../../../../components/orders/AnalyticsTracking";
import { fetchAnalyticsData } from "../../../../lib/action/analytics";

export default async function AnalyticsPage({ searchParams }) {
  // Await searchParams
  const resolvedSearchParams = await searchParams;
  
  // Get period from query params, default to 'year'
  const period = resolvedSearchParams?.period || "year";
  const brandId = resolvedSearchParams?.brandId || null;

  // Fetch analytics data on server side
  const analyticsData = await fetchAnalyticsData(period, brandId);

  return (
    <div>
      <AnalyticsTracking 
        initialBrandRedemptions={analyticsData.brandRedemptions || []}
        initialSettlements={analyticsData.settlements || []}
        initialPeriod={analyticsData.period}
      />
    </div>
  );
}