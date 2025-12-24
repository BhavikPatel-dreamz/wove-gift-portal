"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import SettlementBanking from '../../../../../../../components/settlements/SettlementBanking'
import SettlementTabs from "../../../../../../../components/settlements/SettlementTabs";
import { getSettlementBankingDetails } from "../../../../../../../lib/action/brandPartner";

const BankingPage = () => {
    const router = useRouter();
    const params = useParams();
    const settlementId = params.settlementId;

    const [banking, setBanking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (settlementId) {
            fetchBankingDetails();
        }
    }, [settlementId]);

    const fetchBankingDetails = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#197fe6] mx-auto mb-4"></div>
                    <p className="text-zinc-600">Loading banking details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
                <div className="text-center">
                    <div className="rounded-lg bg-red-50 p-6">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-red-800">{error}</p>
                        <button 
                            onClick={fetchBankingDetails}
                            className="mt-4 px-4 py-2 bg-[#197fe6] text-white rounded-lg hover:bg-[#197fe6]/90"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]">
            <main className="flex w-full flex-1 justify-center py-8 sm:py-12">
                <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                    <SettlementTabs brandId={banking?.brandId} />
                    <SettlementBanking banking={banking} />
                </div>
            </main>
        </div>
    )
}

export default BankingPage;