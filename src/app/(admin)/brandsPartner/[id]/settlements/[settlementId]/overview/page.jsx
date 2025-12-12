
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import SettlementTabs from "../../../../../../../components/settlements/SettlementTabs";
import OverviewTab from "../../../../../../../components/settlements/OverviewTab";
import { getSettlementDetails } from "../../../../../../../lib/action/brandPartner";

const SettlementDetailsPage = () => {
    const router = useRouter();
    const params = useParams();
    const settlementId = params.settlementId;

    const [settlement, setSettlement] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettlementDetails();
    }, [settlementId]);

    const fetchSettlementDetails = async () => {
        setLoading(true);
        try {
            const res = await getSettlementDetails(settlementId);
            console.log("-----------",res);
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

    const StatusBadge = ({ status }) => {
        const statusConfig = {
            Pending: { color: "bg-[#FFC107]/10 text-[#FFC107]", dotColor: "bg-[#FFC107]" },
            Paid: { color: "bg-[#28A745]/10 text-[#28A745]", dotColor: "bg-[#28A745]" },
            InReview: { color: "bg-[#DC3545]/10 text-[#DC3545]", dotColor: "bg-[#DC3545]" },
            Disputed: { color: "bg-purple-600/10 text-purple-600", dotColor: "bg-purple-600" },
        };

        const config = statusConfig[status] || statusConfig.Pending;

        return (
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${config.color}`}>
                <span className={`h-2 w-2 rounded-full ${config.dotColor}`}></span>
                {status || "Pending"}
            </div>
        );
    };


    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]">
            <main className="flex w-full flex-1 justify-center py-8 sm:py-12">
                <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">

                    {/* Title Section */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-4xl">
                                {getMonthYear(settlement.periodStart)} Settlement
                            </h1>
                            <p className="text-base font-normal text-zinc-500">
                                Review the complete financial breakdown for this period.
                            </p>
                        </div>
                        <StatusBadge status={settlement.status} />
                    </div>


                    <SettlementTabs />
                    <OverviewTab settlement={settlement} />

                </div>
            </main>
        </div>
    );
};

export default SettlementDetailsPage;