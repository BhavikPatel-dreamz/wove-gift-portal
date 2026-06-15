import { redirect } from "next/navigation";

/**
 * /brandsPartner/[id]/settlements/[settlementId]/payments
 *
 * Payments detail is surfaced inside the Overview tab.
 * Redirect to keep any deep-linked or programmatically-pushed
 * URLs from landing on a 404.
 */
const BrandSettlementPaymentsPage = async ({ params }) => {
  const { id, settlementId } = await params;
  redirect(`/brandsPartner/${id}/settlements/${settlementId}/overview`);
};

export default BrandSettlementPaymentsPage;
