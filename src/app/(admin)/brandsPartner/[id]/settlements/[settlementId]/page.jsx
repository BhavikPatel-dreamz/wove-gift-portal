import { redirect } from "next/navigation";

const BrandSettlementPage = async ({ params }) => {
  const { id, settlementId } = await params;
  redirect(`/brandsPartner/${id}/settlements/${settlementId}/overview`);
};

export default BrandSettlementPage;
