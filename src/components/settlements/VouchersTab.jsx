"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getSettlementVouchersList } from "../../lib/action/brandPartner";
import { currencyList } from "../brandsPartner/currency";


const VouchersTab = ({ settlementId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [voucherStats, setVoucherStats] = useState(null);
    const [pagination, setPagination] = useState({});
    const [expandedDenominations, setExpandedDenominations] = useState(new Set());

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: "",
        status: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const filterOptions = [
        { value: "Paid", label: "Paid" },
        { value: "Partial", label: "Partial" },
        { value: "Pending", label: "Pending" },
        { value: "Disputed", label: "Disputed" },
    ];

    if (!settlementId) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-red-600">Settlement ID is missing</p>
                </div>
            </div>
        );
    }

    const getCurrencySymbol = (code) =>
        currencyList.find((c) => c.code === code)?.symbol || "$";

    useEffect(() => {
        fetchVouchers();
    }, [settlementId, filters]);

    console.log("pagination", pagination);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await getSettlementVouchersList(settlementId, filters);
            if (res.success) {
                setData(res.data);
                setSummary(res.summary);
                setVoucherStats(res.voucherStats);
                setPagination(res.pagination);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to fetch vouchers");
        }
        setLoading(false);
    };

    const StatusBadge = ({ status }) => {
        const config = {
            Paid: "bg-[#E5FFF1] text-[#00813B]",
            Partial: "bg-yellow-100 text-yellow-800",
            Pending: "bg-blue-100 text-blue-800",
            Disputed: "bg-red-100 text-red-800",
            Redeemed: "bg-[#DEFFF4] text-[#10B981]",
            
        };

        return (
            <span className={`text-xs font-medium px-2.5 py-2 rounded-md ${config[status] || config.Pending}`}>
                {status}
            </span>
        );
    };

    if (loading && !data.length) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading vouchers...</p>
                </div>
            </div>
        );
    }

    return (
            <div className="flex flex-col gap-6 p-3">
            {/* Statistics Cards */}
            {voucherStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
                    <div className="flex [w-250px] h-[85px] flex-col justify-center gap-2 p-6 bg-[#EFF6FE] border-1 border-[#BEDBFF] rounded-xl">
                        <p className="text-[#1F59EE] text-[14px] font-semibold">Total Issued</p>
                        <p className="text-[#1F59EE] text-[16px] font-medium">{voucherStats.totalIssued}</p>
                    </div>
                    <div className="flex [w-250px] h-[85px] justify-center flex-col gap-2 p-6 bg-[#F0FDF4] border-1 border-[#E2E8F0] rounded-xl">
                        <p className="text-[#00813B] text-[14px] font-semibold">Redeemed</p>
                        <p className="text-[#00813B] text-[16px] font-medium">
                            {String(voucherStats.totalRedeemed).padStart(2, '0')}
                        </p>
                    </div>
                    <div className="flex [w-250px] h-[85px] justify-center flex-col gap-2 p-6 bg-[#FAF5FF] border-1 border-[#E2E8F0] rounded-xl">
                        <p className="text-[#9810FA] text-[14px] font-semibold">Unredeemed</p>
                        <p className="text-[#9810FA] text-[16px] font-medium">{voucherStats.totalUnredeemed}</p>
                    </div>
                    <div className="flex [w-250px] h-[85px] justify-center flex-col gap-2 p-6 bg-[#FFF7ED] border-1 border-[#E2E8F0] rounded-xl">
                        <p className="text-[#F55101] text-[14px] font-semibold">Redemption Rate</p>
                        <p className="text-[#F55101] text-[16px] font-medium">{voucherStats.redemptionRate}%</p>
                    </div>
                </div>
            )}

            {/* Denomination Breakdown Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Denomination Breakdown</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Redeemed</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.length > 0 ? (
                                data.map((row, index) => {
                                    const currSymbol = getCurrencySymbol(row.currency);
                                    return (
                                        <tr key={row.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {row.orderNumber}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {row.senderName || row.receiverName || 'N/A'}<br />
                                               {row.senderEmail || row.receiverEmail || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={row.redeemedVouchers > 0 ? 'Redeemed' : 'Pending'} />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {currSymbol} {row.baseAmount?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {currSymbol} {(row.baseAmount * (row.redeemedVouchers / row.totalVouchers || 0)).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={row.status} />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No vouchers found for this settlement period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View - Only visible on mobile */}
            <div className="md:hidden space-y-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="text-base font-semibold text-gray-900">Denomination Breakdown</h3>
                </div>
                
                {data.length > 0 ? (
                    data.map((row, index) => {
                        const currSymbol = getCurrencySymbol(row.currency);
                        return (
                            <div key={row.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
                                {/* Order ID and Payment Status */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                        <p className="text-sm font-semibold text-gray-900">{row.orderNumber}</p>
                                    </div>
                                    <StatusBadge status={row.status} />
                                </div>
                                
                                {/* Customer Info */}
                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                    <p className="text-sm font-medium text-gray-900">{row.senderName || row.receiverName || 'N/A'}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{row.senderEmail || row.receiverEmail || 'N/A'}</p>
                                </div>

                                {/* Value and Redeemed Amount */}
                                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Value</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {currSymbol} {row.baseAmount?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Redeemed</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {currSymbol} {(row.baseAmount * (row.redeemedVouchers / row.totalVouchers || 0)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Redemption Status */}
                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-xs text-gray-500 mb-2">Redemption Status</p>
                                    <StatusBadge status={row.redeemedVouchers > 0 ? 'Redeemed' : 'Pending'} />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <p className="text-sm text-slate-500">No vouchers found for this settlement period.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VouchersTab;