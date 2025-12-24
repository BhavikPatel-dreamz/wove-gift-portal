"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { getSettlementVouchersList } from "../../lib/action/brandPartner";
import { currencyList } from "../brandsPartner/currency";

const VouchersTab = ({settlementId}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState({});
  
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: "",
        status: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    });

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

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await getSettlementVouchersList(settlementId, filters);
            if (res.success) {
                setData(res.data);
                setSummary(res.summary);
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
            <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${config[status] || config.Pending}`}>
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
        <div className="flex flex-col gap-6">
            {/* Summary Cards */}
            {summary && data.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">Base Amount</p>
                        <p className="text-slate-900 text-2xl font-bold">
                            {getCurrencySymbol(data[0]?.currency)}{summary.totalPayable?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {data[0]?.settlementTrigger === 'onRedemption' ? 'On Redemption' : 'On Purchase'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">Commission</p>
                        <p className="text-slate-900 text-2xl font-bold text-orange-600">
                            -{getCurrencySymbol(data[0]?.currency)}{summary.totalCommission?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {data[0]?.commissionType === 'Percentage' 
                                ? `${data[0]?.commissionValue}% of base` 
                                : `Fixed ${getCurrencySymbol(data[0]?.currency)}${data[0]?.commissionValue}`}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">VAT on Commission</p>
                        <p className="text-slate-900 text-2xl font-bold text-purple-600">
                            +{getCurrencySymbol(data[0]?.currency)}{summary.totalVat?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {data[0]?.vatRate}% of commission
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">Net Payable</p>
                        <p className="text-slate-900 text-2xl font-bold text-green-600">
                            {getCurrencySymbol(data[0]?.currency)}{summary.totalNetPayable?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Base - Commission + VAT
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-5 border border-slate-200 bg-white shadow-sm">
                        <p className="text-slate-500 text-sm font-medium">Success Rate</p>
                        <p className="text-slate-900 text-2xl font-bold">{summary.successRate}%</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {summary.paidCount} of {summary.totalOrders} paid
                        </p>
                    </div>
                </div>
            )}


            {/* Table Container */}
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col flex-1 min-h-0 shadow-sm">
                {/* Filters */}
                <div className="p-4 flex flex-col md:flex-row gap-3 items-center border-b border-slate-200">
                    <div className="relative w-full md:w-auto md:flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Search by order ID, sender, or receiver..."
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <select
                            value={filters.status}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="w-full md:w-auto text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                        >
                            <option value="">Status: All</option>
                            <option value="Paid">Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Pending">Pending</option>
                            <option value="Disputed">Disputed</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 font-semibold" scope="col">Order ID</th>
                                <th className="px-6 py-3 font-semibold" scope="col">Sender</th>
                                <th className="px-6 py-3 font-semibold" scope="col">Receiver</th>
                                <th className="px-6 py-3 font-semibold" scope="col">Vouchers</th>
                                <th className="px-6 py-3 font-semibold" scope="col">Status</th>
                                <th className="px-6 py-3 text-right font-semibold" scope="col">Base Amount</th>
                                <th className="px-6 py-3 text-right font-semibold" scope="col">Commission</th>
                                <th className="px-6 py-3 text-right font-semibold" scope="col">VAT</th>
                                <th className="px-6 py-3 text-right font-semibold" scope="col">Net Payable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {data.length > 0 ? (
                                data.map((row) => {
                                    const currSymbol = getCurrencySymbol(row.currency);

                                    return (
                                        <tr key={row.id} className="bg-white hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs text-slate-700">
                                                    {row.orderNumber}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {new Date(row.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">
                                                    {row.senderName || 'N/A'}
                                                </div>
                                                <div className="text-slate-500 text-xs">
                                                    {row.senderEmail || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">
                                                    {row.receiverName || 'N/A'}
                                                </div>
                                                <div className="text-slate-500 text-xs">
                                                    {row.receiverEmail || 'N/A'}
                                                </div>
                                                {row.receiverPhone && row.receiverPhone !== "N/A" && (
                                                    <div className="text-slate-500 text-xs">
                                                        {row.receiverPhone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900 font-medium">
                                                    {row.totalVouchers} voucher{row.totalVouchers !== 1 ? 's' : ''}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {row.redeemedVouchers} redeemed
                                                </div>
                                                <div className="text-xs text-green-600 font-medium">
                                                    {row.redemptionRate}% rate
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="text-slate-900 font-bold">
                                                    {currSymbol}{row.baseAmount?.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {row.settlementTrigger === 'onRedemption' ? 'Redeemed' : 'Sold'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="text-orange-600 font-bold">
                                                    -{currSymbol}{row.commissionAmount?.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {row.commissionType === 'Percentage' 
                                                        ? `${row.commissionValue}%` 
                                                        : 'Fixed'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="text-purple-600 font-bold">
                                                    +{currSymbol}{row.vatAmount?.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {row.vatRate}% of comm.
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="text-green-600 font-bold text-base">
                                                    {currSymbol}{row.netPayable?.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Final amount
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                                        No vouchers found for this settlement period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 0 && (
                    <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-600 gap-4 border-t border-slate-200">
                        <span>
                            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
                        </span>
                        <div className="inline-flex rounded-lg shadow-sm" role="group">
                            <button
                                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                                disabled={!pagination.hasPrevPage}
                                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-l-lg hover:bg-slate-100 focus:z-10 focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                            >
                                Previous
                            </button>
                            {[...Array(Math.min(pagination.totalPages, 3))].map((_, i) => {
                                const pageNum = i + 1;
                                const isActive = pageNum === pagination.currentPage;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                                        className={`px-3 py-2 text-sm font-medium border-t border-b ${isActive
                                                ? "text-white bg-primary border-primary hover:bg-primary/90"
                                                : "text-slate-600 bg-white border-slate-200 hover:bg-slate-100"
                                            } focus:z-10 focus:ring-2 focus:ring-primary`}
                                        type="button"
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                                disabled={!pagination.hasNextPage}
                                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-r-lg hover:bg-slate-100 focus:z-10 focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VouchersTab;