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

    const handleSearch = (value) => {
        setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    };

    const handleStatusFilter = (status) => {
        setFilters((prev) => ({ ...prev, status, page: 1 }));
    };


    const StatusBadge = ({ status }) => {
        const config = {
            Paid: "bg-green-100 text-green-800",
            Partial: "bg-yellow-100 text-yellow-800",
            Pending: "bg-blue-100 text-blue-800",
            Disputed: "bg-red-100 text-red-800",
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2 p-6 bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-xl">
                        <p className="text-[#2563EB] text-sm font-medium">Total Issued</p>
                        <p className="text-[#1E40AF] text-3xl font-bold">{voucherStats.totalIssued}</p>
                    </div>
                    <div className="flex flex-col gap-2 p-6 bg-[#D1FAE5] border-2 border-[#A7F3D0] rounded-xl">
                        <p className="text-[#059669] text-sm font-medium">Redeemed</p>
                        <p className="text-[#047857] text-3xl font-bold">
                            {String(voucherStats.totalRedeemed).padStart(2, '0')}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 p-6 bg-[#F3E8FF] border-2 border-[#E9D5FF] rounded-xl">
                        <p className="text-[#9333EA] text-sm font-medium">Unredeemed</p>
                        <p className="text-[#7E22CE] text-3xl font-bold">{voucherStats.totalUnredeemed}</p>
                    </div>
                    <div className="flex flex-col gap-2 p-6 bg-[#FEF3C7] border-2 border-[#FDE68A] rounded-xl">
                        <p className="text-[#D97706] text-sm font-medium">Redemption Rate</p>
                        <p className="text-[#B45309] text-3xl font-bold">{voucherStats.redemptionRate}%</p>
                    </div>
                </div>
            )}

            {/* Denomination Breakdown Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
        </div>
    );
};

export default VouchersTab;