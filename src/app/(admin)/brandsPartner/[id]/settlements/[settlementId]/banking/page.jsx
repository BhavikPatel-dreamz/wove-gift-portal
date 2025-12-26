"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import SettlementBanking from '../../../../../../../components/settlements/SettlementBanking'
import SettlementTabs from "../../../../../../../components/settlements/SettlementTabs";
import { getSettlementBankingDetails, getSettlementDetails } from "../../../../../../../lib/action/brandPartner";
import SettlementDashboard from "../../../../../../../components/settlements/SettlementDashboard";

function BankingPage() {
  const router = useRouter();
  const params = useParams();
  const settlementId = params.settlementId;
  
  const [banking, setBanking] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [loadingBanking, setLoadingBanking] = useState(true);
  const [loadingSettlement, setLoadingSettlement] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (settlementId) {
      fetchBankingDetails();
      fetchSettlementDetails();
    }
  }, [settlementId]);

  const fetchBankingDetails = async () => {
    try {
      setLoadingBanking(true);
      const response = await getSettlementBankingDetails(settlementId);
      if (response.success) {
        setBanking(response.data);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch banking details");
        toast.error(response.message || "Failed to fetch banking details");
      }
    } catch (err) {
      setError("An error occurred while fetching banking details");
      toast.error("An error occurred while fetching banking details");
      console.error(err);
    } finally {
      setLoadingBanking(false);
    }
  };

  const fetchSettlementDetails = async () => {
    try {
      setLoadingSettlement(true);
      const res = await getSettlementDetails(settlementId);
      if (res.success) {
        setSettlement(res.data);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to fetch settlement details");
      router.push("/settlements");
    } finally {
      setLoadingSettlement(false);
    }
  };

  const getCurrencySymbol = (code) => {
    const currencyList = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    };
    return currencyList[code] || code;
  };

  if (!isMounted || loadingBanking || loadingSettlement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading banking details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-600">{error}</div>
        <button
          onClick={fetchBankingDetails}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
     <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]">
                    <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                      <SettlementDashboard
                       settlement={settlement}
                       getCurrencySymbol={getCurrencySymbol}
                        />
    
                        {/* Tabs */}    
                        <div className="bg-white rounded-lg shadow-md p-6">
                       <SettlementTabs />
                       <SettlementBanking banking={banking} />
                    </div>
                    </div>
            </div>
    
  );
}

export default BankingPage;