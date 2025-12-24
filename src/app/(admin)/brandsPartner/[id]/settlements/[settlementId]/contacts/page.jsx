"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import SettlementContacts from '../../../../../../../components/settlements/SettlementContacts'
import SettlementTabs from "../../../../../../../components/settlements/SettlementTabs";
import { getSettlementContacts } from "../../../../../../../lib/action/brandPartner";

const ContactPage = () => {
    const router = useRouter();
    const params = useParams();
    const settlementId = params.settlementId;

    const [settlement, setSettlement] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#197fe6] mx-auto mb-4"></div>
                    <p className="text-zinc-600">Loading settlement details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]">
            <main className="flex w-full flex-1 justify-center py-8 sm:py-12">
                <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                    <SettlementTabs brandId={settlement?.brandId} />
                    <SettlementContacts contacts={settlement}/>
                </div>
            </main>
        </div>
    )
}

export default ContactPage;