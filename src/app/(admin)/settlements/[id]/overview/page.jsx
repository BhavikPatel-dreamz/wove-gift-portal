
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { getSettlementDetails } from "../../../../../lib/action/brandPartner";
import OverviewTab from "../../../../../components/settlements/OverviewTab";

const SettlementDetailsPage = () => {
    const router = useRouter();
    const params = useParams();
    const settlementId = params.id;

    const [settlement, setSettlement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettlementDetails();
    }, [settlementId]);

    const fetchSettlementDetails = async () => {
        setLoading(true);
        try {
            const res = await getSettlementDetails(settlementId);

            if (res.success) {
                setSettlement(res.data);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to fetch settlement details");
            router.push("/settlements");
        }
        setLoading(false);
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

    if (!settlement) {
        return null;
    }

    const getMonthYear = (date) => {
        if (!date) return "N/A";

        try {
            return new Date(date).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    return (
        <>
            <OverviewTab settlement={settlement} />

        </>
    );
};

export default SettlementDetailsPage;