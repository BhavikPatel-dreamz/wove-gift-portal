import { notFound } from "next/navigation";
import { getSettlementContacts } from "../../../../../lib/action/brandPartner";
import SettlementContacts from "../../../../../components/settlements/SettlementContacts";

const ContactPage = async ({ params }) => {
  const { id: settlementId } = await params;

  if (!settlementId) {
    notFound();
  }

  const response = await getSettlementContacts(settlementId);

  if (!response.success) {
    console.error("Failed to fetch contacts:", response.message);
  }

  return (
    <SettlementContacts 
      contacts={response.data || []} 
      error={!response.success ? response.message : null}
    />
  );
};

export default ContactPage;