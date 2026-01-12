import { notFound } from "next/navigation";
import { getSettlementTerms } from "../../../../../lib/action/brandPartner";
import SettlementTerms from "../../../../../components/settlements/SettlementTermsPage";

const TermsPage = async ({ params }) => {
  const { id: settlementId } = await params;

  if (!settlementId) {
    notFound();
  }

  const result = await getSettlementTerms(settlementId);

  if (!result.success) {
    console.error("Failed to fetch terms:", result.message);
  }

  return (
    <SettlementTerms 
      terms={result.data || null}
      error={!result.success ? result.message : null}
    />
  );
};

export default TermsPage;