import BrandAnalyticsTable from "../../../../components/orders/BrandAnalyticsTable";
import { fetchBrandAnalytics } from "../../../../lib/action/analytics";

export default async function SettlementsPage({ searchParams }) {
  // Await searchParams
  const resolvedSearchParams = await searchParams;
  
  // Get parameters from query
  const year = resolvedSearchParams?.filterMonth?.split("-")[0] || null;
  const month = resolvedSearchParams?.filterMonth?.split("-")[1] || null;
  const search = resolvedSearchParams?.search || null;

  // Fetch brand analytics data on server side with filters
  const analyticsData = await fetchBrandAnalytics({
    filterYear: year,
    filterMonth: month,
    search: search,
  });

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