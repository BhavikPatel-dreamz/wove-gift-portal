import { notFound } from "next/navigation";
import SettlementContacts from "@/components/settlements/SettlementContacts";
import { getSettlementContacts } from "../../../../../../../lib/action/brandPartner";

const ContactPage = async ({ params }) => {
  const { settlementId } = await params;

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