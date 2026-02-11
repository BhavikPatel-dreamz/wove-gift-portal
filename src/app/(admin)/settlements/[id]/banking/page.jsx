import { notFound } from "next/navigation";
import { getSettlementBankingDetails } from "../../../../../lib/action/brandPartner";
import SettlementBanking from "../../../../../components/settlements/SettlementBanking";

const BankingPage = async ({ params }) => {
  const { id: settlementId } = await params;

  if (!settlementId) {
    notFound();
  }

  const response = await getSettlementBankingDetails(settlementId);

  if (!response.success) {
    console.error("Failed to fetch banking details:", response.message);
  }

  return (
    <SettlementBanking 
      banking={response.data || null}
      error={!response.success ? response.message : null}
    />
  );
};

export default BankingPage;