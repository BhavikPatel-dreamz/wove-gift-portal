"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import OverviewTab from "../../../../../../../components/settlements/OverviewTab";
import { getSettlementDetails } from "../../../../../../../lib/action/brandPartner";

const SettlementDetailsPage = () => {
    const params = useParams();
    const settlementId = params.settlementId;
    const [settlement, setSettlement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (settlementId) {
            fetchSettlementDetails();
        }
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
            <OverviewTab settlement={settlement} />
        </>

    );
};

export default SettlementDetailsPage;