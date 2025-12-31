"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import SettlementDashboard from "../../../../components/settlements/SettlementDashboard";
import { getSettlementDetails } from "../../../../lib/action/brandPartner";
import SettlementTabs from "../../../../components/settlements/SettlementTabs";

const SettlementLayout = ({ children }) => {
    const router = useRouter();
    const params = useParams();
    const settlementId = params.id; // Changed from settlementId to id

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
                router.push("/settlements");
            }
        } catch (error) {
            toast.error("Failed to fetch settlement details");
            router.push("/settlements");
        } finally {
            setLoading(false);
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

    const downloadReport = async (id) => {
        try {
            toast.success("Downloading report...");
            // Add your download logic here
        } catch (error) {
            toast.error("Failed to download report");
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

    if (!settlement) {
        return null;
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]">
            <main className="flex w-full flex-1 justify-center py-8 sm:py-12">
                <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                    
                    {/* Title Section - Persistent across tabs */}
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

                    {/* Dashboard - Persistent across tabs */}
                    <SettlementDashboard 
                        settlement={settlement} 
                        getCurrencySymbol={getCurrencySymbol} 
                    />
                    
                    <div className="bg-white rounded-lg">
                        <SettlementTabs />
                        <div className="bg-white rounded-lg p-6">
                            {/* Pass settlement data to children */}
                            {/* {children} */}
                            {React.cloneElement(children, { settlement })}
                        </div>
                    </div>

                    {/* Action Buttons - Persistent across tabs */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={() => downloadReport(settlementId)}
                            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                        >
                            Download Report
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettlementLayout;