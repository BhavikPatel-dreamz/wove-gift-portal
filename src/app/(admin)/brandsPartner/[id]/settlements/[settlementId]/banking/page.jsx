"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import SettlementBanking from '../../../../../../../components/settlements/SettlementBanking';
import { getSettlementBankingDetails } from "../../../../../../../lib/action/brandPartner";

function BankingPage() {
  const params = useParams();
  const settlementId = params.settlementId;
  const [banking, setBanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settlementId) {
      fetchBankingDetails();
    }
  }, [settlementId]);

  const fetchBankingDetails = async () => {
    setLoading(true);
    try {
      const response = await getSettlementBankingDetails(settlementId);
      if (response.success) {
        setBanking(response.data);
      } else {
        toast.error(response.message || "Failed to fetch banking details");
      }
    } catch (err) {
      toast.error("An error occurred while fetching banking details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#197fe6]"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SettlementBanking banking={banking} />
    </>
  );
}

export default BankingPage;