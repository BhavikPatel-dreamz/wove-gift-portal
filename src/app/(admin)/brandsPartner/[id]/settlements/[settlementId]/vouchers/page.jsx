import VouchersTab from "../../../../../../../components/settlements/VouchersTab";
import { notFound } from "next/navigation";
import { getSettlementVouchersList } from "../../../../../../../lib/action/brandPartner";

const VouchersPage = async ({ params, searchParams }) => {
  const { settlementId } = await params;
  const resolvedSearchParams = await searchParams;

  if (!settlementId) {
    notFound();
  }

  const filters = {
    page: Number(resolvedSearchParams.page) || 1,
    limit: Number(resolvedSearchParams.limit) || 10,
    search: resolvedSearchParams.search || "",
    status: resolvedSearchParams.status || "",
    sortBy: resolvedSearchParams.sortBy || "createdAt",
    sortOrder: resolvedSearchParams.sortOrder || "desc",
  };

  const res = await getSettlementVouchersList(settlementId, filters);

  if (!res.success) {
    console.error("Failed to fetch vouchers:", res.message);
  }

  return (
    <VouchersTab
      settlementId={settlementId}
      initialData={res.data || []}
      initialSummary={res.summary || null}
      initialVoucherStats={res.voucherStats || null}
      initialPagination={res.pagination || {}}
      initialFilters={filters}
    />
  );
};

export default VouchersPage;