// app/analytics/page.js (or your analytics route)
import AnalyticsTracking from "@/components/orders/AnalyticsTracking";
import { fetchAnalyticsData, getBrandsForAnalytics } from "@/lib/action/analytics";

export default async function AnalyticsPage({ searchParams }) {
  // Await searchParams
  const resolvedSearchParams = await searchParams;
  
  // Extract filter parameters with lastMonth as default
  const period = resolvedSearchParams?.period || "lastMonth";
  const brandId = resolvedSearchParams?.brandId || null;
  const dateFrom = resolvedSearchParams?.dateFrom || null;
  const dateTo = resolvedSearchParams?.dateTo || null;
  const filterMonth = resolvedSearchParams?.filterMonth || null;

  // Fetch analytics data and brands in parallel
  const [analyticsData, brandsResult] = await Promise.all([
    fetchAnalyticsData({
      period,
      brandId,
      dateFrom,
      dateTo,
      filterMonth,
    }),
    getBrandsForAnalytics(),
  ]);

  return (
    <div>
      <AnalyticsTracking 
        initialBrandRedemptions={analyticsData.brandRedemptions || []}
        initialSettlements={analyticsData.settlements || []}
        initialPeriod={analyticsData.period}
        initialBrands={brandsResult.data || []}
      />
    </div>
  );
}