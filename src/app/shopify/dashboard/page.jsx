import { Suspense } from "react";
import { getDashboardData } from "../../../lib/action/dashbordAction";
import Dashboard from "../../../components/Dashboard/Dashboard";

// Server Component that fetches data
async function DashboardContent({ searchParams }) {
  const shop = searchParams?.shop;
  const period = searchParams?.period || 'month';
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;

  // Fetch data on the server
  const dashboardData = await getDashboardData({
    period,
    ...(startDate && endDate ? { startDate, endDate } : {}),
    shop,
  });

  return <Dashboard  shopParam={shop} dashboardData={dashboardData}/>;
}

// Main page component (Server Component by default)
export default function ShopifyMainPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}