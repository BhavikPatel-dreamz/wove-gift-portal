import BrandAnalyticsTable from "../../../../components/orders/BrandAnalyticsTable";
import { fetchBrandAnalytics, getBrandsForAnalytics } from "../../../../lib/action/analytics";
import { getSettlements } from "../../../../lib/action/brandPartner";

export default async function SettlementsPage({ searchParams }) {
  const params = await searchParams;

  const parameters = {
    search: params.search || "",
    filterMonth: params.filterMonth || null,
    filterYear: params.filterYear || null,
    brandId: params.brandId || "",
  };

  // const analyticsData = await getSettlements(parameters);
  // Fetch analytics data and brands in parallel
  const [analyticsData, brandsResult] = await Promise.all([
    getSettlements(parameters),
    getBrandsForAnalytics(),
  ]);

  console.log(analyticsData);
  return (
    <div>
      <BrandAnalyticsTable
        initialBrands={analyticsData.data || []}
        initialSummary={analyticsData.summary || {}}
        initialPeriod={analyticsData.period}
        brandsList={brandsResult.data || []}
      />
    </div>
  );
}