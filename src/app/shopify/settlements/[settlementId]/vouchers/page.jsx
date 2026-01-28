"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { getSettlementVouchersList } from "../../../../../lib/action/brandPartner";
import Pagination from "../../../../../components/client/giftflow/Pagination";
import { currencyList } from "../../../../../components/brandsPartner/currency";

// Skeleton Components
const StatCardSkeleton = () => (
    <div className="flex w-full h-[85px] flex-col justify-center gap-2 p-6 bg-gray-100 border border-gray-200 rounded-xl animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-5 bg-gray-300 rounded w-16"></div>
    </div>
);

const TableRowSkeleton = () => (
    <tr className="border-b border-gray-200">
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
        </td>
    </tr>
);

const MobileCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
    </div>
);

const VouchersTab = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const settlementId = params?.settlementId;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [voucherStats, setVoucherStats] = useState(null);
    const [pagination, setPagination] = useState({});

    const filters = useMemo(() => ({
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 10,
        search: searchParams.get("search") || "",
        status: searchParams.get("status") || "",
        sortBy: searchParams.get("sortBy") || "createdAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
    }), [searchParams]);

    const filterOptions = useMemo(() => [
        { value: "Paid", label: "Paid" },
        { value: "Partial", label: "Partial" },
        { value: "Pending", label: "Pending" },
        { value: "Disputed", label: "Disputed" },
    ], []);

    const getCurrencySymbol = useCallback((code) => {
        return currencyList.find((c) => c.code === code)?.symbol || "$";
    }, []);

    const fetchVouchers = useCallback(async () => {
        if (!settlementId) return;

        setLoading(true);
        try {
            const res = await getSettlementVouchersList(settlementId, filters);
            if (res.success) {
                setData(res.data || []);
                setSummary(res.summary || null);
                setVoucherStats(res.voucherStats || null);
                setPagination(res.pagination || {});
            } else {
                toast.error(res.message || "Failed to fetch vouchers");
            }
        } catch (error) {
            console.error("Error fetching vouchers:", error);
            toast.error("Failed to fetch vouchers");
        } finally {
            setLoading(false);
        }
    }, [settlementId, filters]);

    useEffect(() => {
        fetchVouchers();
    }, [fetchVouchers]);

    const StatusBadge = useCallback(({ status }) => {
        const config = {
            Paid: "bg-[#E5FFF1] text-[#00813B]",
            Partial: "bg-yellow-100 text-yellow-800",
            Pending: "bg-blue-100 text-blue-800",
            Disputed: "bg-red-100 text-red-800",
            Redeemed: "bg-[#DEFFF4] text-[#10B981]",
            Active: "bg-blue-100 text-blue-800",
            Issued: "bg-blue-100 text-blue-800",
            "Partially Redeemed": "bg-yellow-100 text-yellow-800",
            PartiallyRedeemed: "bg-yellow-100 text-yellow-800",
            Expired: "bg-orange-100 text-orange-800",
            Cancelled: "bg-red-100 text-red-800",
        };

        return (
            <span className={`text-xs font-medium px-2.5 py-2 rounded-md ${config[status] || config.Pending}`}>
                {status}
            </span>
        );
    }, []);

    if (!settlementId) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <p className="text-red-600">Settlement ID is missing</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-3">
            {/* Statistics Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            ) : voucherStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex w-full h-[85px] flex-col justify-center gap-2 p-6 bg-[#EFF6FE] border border-[#BEDBFF] rounded-xl">
                        <p className="text-[#1F59EE] text-[14px] font-semibold">Total Issued</p>
                        <p className="text-[#1F59EE] text-[16px] font-medium">{voucherStats.totalIssued || 0}</p>
                    </div>
                    <div className="flex w-full h-[85px] justify-center flex-col gap-2 p-6 bg-[#F0FDF4] border border-[#E2E8F0] rounded-xl">
                        <p className="text-[#00813B] text-[14px] font-semibold">Redeemed</p>
                        <p className="text-[#00813B] text-[16px] font-medium">
                            {voucherStats.totalRedeemed || 0}
                        </p>
                    </div>
                    <div className="flex w-full h-[85px] justify-center flex-col gap-2 p-6 bg-[#FAF5FF] border border-[#E2E8F0] rounded-xl">
                        <p className="text-[#9810FA] text-[14px] font-semibold">Unredeemed</p>
                        <p className="text-[#9810FA] text-[16px] font-medium">{voucherStats.totalUnredeemed || 0}</p>
                    </div>
                    <div className="flex w-full h-[85px] justify-center flex-col gap-2 p-6 bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl">
                        <p className="text-[#F55101] text-[14px] font-semibold">Redemption Rate</p>
                        <p className="text-[#F55101] text-[16px] font-medium">{voucherStats.redemptionRate || 0}%</p>
                    </div>
                </div>
            ) : null}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-[14px] font-semibold text-[#4A4A4A] capitalize font-inter leading-normal">
                        Voucher Orders
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Value</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Redeemed</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                // Show skeleton rows while loading
                                Array.from({ length: filters.limit }).map((_, index) => (
                                    <TableRowSkeleton key={index} />
                                ))
                            ) : data && data.length > 0 ? (
                                data.map((row, index) => {
                                    const currSymbol = getCurrencySymbol(row.currency);
                                    const totalValue = row.totalSold || 0;
                                    const redeemedAmount = row.redeemedAmount || 0;

                                    return (
                                        <tr key={row.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {row.orderNumber}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {row.senderName || row.receiverName || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {row.senderEmail || row.receiverEmail || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {currSymbol}{totalValue.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-green-600">
                                                    {currSymbol}{redeemedAmount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Outstanding: {currSymbol}{(totalValue - redeemedAmount).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={row.status} />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No vouchers found for this settlement period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {pagination && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                        />
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="text-base font-semibold text-gray-900">Voucher Orders</h3>
                </div>

                {loading ? (
                    // Show skeleton cards while loading
                    Array.from({ length: filters.limit }).map((_, index) => (
                        <MobileCardSkeleton key={index} />
                    ))
                ) : data && data.length > 0 ? (
                    data.map((row, index) => {
                        const currSymbol = getCurrencySymbol(row.currency);
                        const totalValue = row.totalSold || 0;
                        const redeemedAmount = row.redeemedAmount || 0;
                        const totalVouchers = row.totalVouchers || 0;
                        const redeemedVouchers = row.redeemedVouchers || 0;

                        return (
                            <div key={row.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
                                {/* Order ID and Status */}
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
                                    <p className="text-sm font-medium text-gray-900">
                                        {row.senderName || row.receiverName || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {row.senderEmail || row.receiverEmail || 'N/A'}
                                    </p>
                                </div>

                                {/* Voucher Count */}
                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-xs text-gray-500 mb-1">Vouchers</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {redeemedVouchers} / {totalVouchers} redeemed
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {row.redemptionRate}% redemption rate
                                    </p>
                                </div>

                                {/* Value and Redeemed Amount */}
                                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Value</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {currSymbol}{totalValue.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Redeemed</p>
                                        <p className="text-sm font-semibold text-green-600">
                                            {currSymbol}{redeemedAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Outstanding Amount */}
                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-xs text-gray-500 mb-1">Outstanding</p>
                                    <p className="text-sm font-semibold text-orange-600">
                                        {currSymbol}{(totalValue - redeemedAmount).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <p className="text-sm text-slate-500">No vouchers found for this settlement period.</p>
                    </div>
                )}
                
                {pagination && pagination.totalPages > 1 && (
                    <div className="p-4">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VouchersTab;