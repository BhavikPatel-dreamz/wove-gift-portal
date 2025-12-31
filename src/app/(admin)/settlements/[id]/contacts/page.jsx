"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getSettlementContacts
} from "../../../../../lib/action/brandPartner";
import SettlementContacts from "../../../../../components/settlements/SettlementContacts";

const ContactPage = () => {
  const router = useRouter();
  const params = useParams();
  const settlementId = params.id;

  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (settlementId) {
      fetchContacts();
    }
  }, [settlementId]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getSettlementContacts(settlementId);
      if (response.success) {
        setSettlement(response.data);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch contacts");
      }
    } catch (err) {
      setError("An error occurred while fetching contacts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SettlementContacts contacts={settlement} loading={loading} />
    </>
  );
};

export default ContactPage;
