import { redirect } from "next/navigation";

const SettlementPage = async ({ params }) => {
  const { id } = await params;
  redirect(`/settlements/${id}/overview`);
};

export default SettlementPage;
