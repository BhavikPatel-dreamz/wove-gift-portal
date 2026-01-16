import BrandAnalyticsTable from "../../../../components/orders/BrandAnalyticsTable";
import { fetchBrandAnalytics } from "../../../../lib/action/analytics";
import { getSettlements } from "../../../../lib/action/brandPartner";

export default async function SettlementsPage({ searchParams }) {
  const params = await searchParams;

  const parameters = {
    search: params.search || "",
    filterMonth: params.filterMonth || null,
    filterYear: params.filterYear || null,
  };

  const analyticsData = await getSettlements(parameters);

  console.log(analyticsData);
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