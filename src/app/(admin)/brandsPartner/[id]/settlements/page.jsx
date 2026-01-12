import { notFound } from "next/navigation";
import { getBrandSettlementHistory } from "../../../../../lib/action/brandPartner";
import BrandSettlementHistoryClient from "../../../../../components/settlements/BrandSettlementHistoryClient";

const BrandSettlementHistoryPage = async ({ params, searchParams }) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  if (!id) {
    notFound();
  }

  // Build query params from searchParams
  const queryParams = {
    page: resolvedSearchParams.page || "1",
    limit: "20",
  };

  // Handle year/month filters
  const year = resolvedSearchParams.year;
  const month = resolvedSearchParams.month;
  
  if (year && year !== "all") {
    if (month && month !== "all") {
      queryParams.filterMonth = `${year}-${month}`;
    } else {
      queryParams.filterYear = year;
    }
  }

  // Handle other filters
  if (resolvedSearchParams.status) {
    queryParams.status = resolvedSearchParams.status;
  }

  if (resolvedSearchParams.search) {
    queryParams.search = resolvedSearchParams.search;
  }

  if (resolvedSearchParams.sortby) {
    const [sortBy, sortOrder] = resolvedSearchParams.sortby.split("_");
    queryParams.sortBy = sortBy;
    if (sortOrder) {
      queryParams.sortOrder = sortOrder;
    }
  }

  // Fetch data on server
  const result = await getBrandSettlementHistory(id, queryParams);

  if (!result.success) {
    console.error("Failed to fetch settlement history:", result.message);
  }

  return (
    <BrandSettlementHistoryClient
      brandId={id}
      initialData={result.data || []}
      initialPagination={result.pagination || {}}
      brandInfo={result.brandInfo || null}
      error={!result.success ? result.message : null}
    />
  );
};

export default BrandSettlementHistoryPage;