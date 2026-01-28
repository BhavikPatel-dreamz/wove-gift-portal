import React from "react";
import { notFound } from 'next/navigation';
import SettlementDashboard from "../../../../components/settlements/SettlementDashboard";
import { getSettlementDetails } from "../../../../lib/action/brandPartner";
import SettlementTabs from "../../../../components/settlements/SettlementTabs";
import SettlementActions from "../../../../components/settlements/SettlementActions";

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
        PartiallyPaid: { color: "bg-blue-600/10 text-blue-600", dotColor: "bg-blue-600" },
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

const SettlementLayout = async ({ children, params }) => {
    const { id: settlementId } = await params;
    const res = await getSettlementDetails(settlementId);

    if (!res.success) {
        return notFound();
    }

    const settlement = res.data;

    // Debug log on server side
    console.log("Settlement Layout Data:", {
        totalSoldAmount: settlement.totalSoldAmount,
        redeemedAmount: settlement.redeemedAmount,
        outstandingAmount: settlement.outstandingAmount,
        netPayable: settlement.netPayable,
        totalSold: settlement.totalSold,
        totalRedeemed: settlement.totalRedeemed,
    });

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8fa]">
            <main className="flex w-full flex-1 justify-center py-8 sm:py-12">
                <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">

                    {/* Title Section - Persistent across tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="60" height="60" rx="6" fill="#1F59EE" fillOpacity="0.08" />
                                <path d="M23.8159 32.8496V44.8496C23.8159 45.2032 23.6754 45.5424 23.4254 45.7924C23.1753 46.0425 22.8362 46.1829 22.4826 46.1829H17.1493C16.7956 46.1829 16.4565 46.0425 16.2064 45.7924C15.9564 45.5424 15.8159 45.2032 15.8159 44.8496V32.8496C15.8159 32.496 15.9564 32.1568 16.2064 31.9068C16.4565 31.6568 16.7956 31.5163 17.1493 31.5163H22.4826C22.8362 31.5163 23.1753 31.6568 23.4254 31.9068C23.6754 32.1568 23.8159 32.496 23.8159 32.8496ZM33.1493 16.8496H27.8159C27.4623 16.8496 27.1232 16.9901 26.8731 17.2401C26.6231 17.4902 26.4826 17.8293 26.4826 18.1829V44.8496C26.4826 45.2032 26.6231 45.5424 26.8731 45.7924C27.1232 46.0425 27.4623 46.1829 27.8159 46.1829H33.1493C33.5029 46.1829 33.842 46.0425 34.0921 45.7924C34.3421 45.5424 34.4826 45.2032 34.4826 44.8496V18.1829C34.4826 17.8293 34.3421 17.4902 34.0921 17.2401C33.842 16.9901 33.5029 16.8496 33.1493 16.8496ZM43.8159 23.5163H38.4826C38.129 23.5163 37.7898 23.6568 37.5398 23.9068C37.2897 24.1568 37.1493 24.496 37.1493 24.8496V44.8496C37.1493 45.2032 37.2897 45.5424 37.5398 45.7924C37.7898 46.0425 38.129 46.1829 38.4826 46.1829H43.8159C44.1695 46.1829 44.5087 46.0425 44.7587 45.7924C45.0088 45.5424 45.1493 45.2032 45.1493 44.8496V24.8496C45.1493 24.496 45.0088 24.1568 44.7587 23.9068C44.5087 23.6568 44.1695 23.5163 43.8159 23.5163Z" fill="#1F59EE" />
                            </svg>

                            <div className="flex flex-col gap-1">
                                <h1 className="text-[22px] font-semibold text-[#1A1A1A] leading-[20px] font-poppins">
                                    {settlement?.brandName} {getMonthYear(settlement.periodStart)} Settlement
                                </h1>
                                <p className="text-[14px] font-medium text-[#64748B] leading-[18px] font-inter">
                                    Review the complete financial breakdown for this period.
                                </p>
                            </div>
                        </div>
                        <StatusBadge status={settlement.status} />
                    </div>

                    {/* Dashboard - Persistent across tabs */}
                    <SettlementDashboard settlement={settlement} />

                    <div className="bg-white rounded-lg">
                        <SettlementTabs />
                        <div className="bg-white rounded-lg p-6">
                            {/* Pass settlement data to children */}
                            {React.cloneElement(children, { settlement })}
                        </div>
                    </div>

                    {/* Action Buttons - Persistent across tabs */}
                    {/* <SettlementActions settlementId={settlementId} /> */}
                </div>
            </main>
        </div>
    );
};

export default SettlementLayout;