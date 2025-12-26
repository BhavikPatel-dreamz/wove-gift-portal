"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SettlementContacts from '../../../../../../../components/settlements/SettlementContacts';
import { getSettlementContacts } from "../../../../../../../lib/action/brandPartner";

const ContactPage = () => {
  const params = useParams();
  const settlementId = params.settlementId;
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settlementId) {
      fetchContacts();
    }
  }, [settlementId]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await getSettlementContacts(settlementId);
      if (response.success) {
        setContacts(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SettlementContacts contacts={contacts} loading={loading} />
    </>


  );
};

export default ContactPage;