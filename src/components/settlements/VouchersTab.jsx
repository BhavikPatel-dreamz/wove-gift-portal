"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { getSettlementVouchersList } from "../../lib/action/brandPartner";
import { currencyList } from "../brandsPartner/currency";
import SearchIcon from "@/icons/SearchIcon";
import CustomDropdown from "../ui/CustomDropdown";


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
        <div className="flex flex-col gap-6">
            {/* Voucher Statistics Section */}
            {voucherStats && (
                <div className="bg-white rounded-xl">
                    {/* Top Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex flex-col gap-2 p-5 border-2 border-[#BEDBFF] bg-[#EFF6FE] rounded-lg">
                            <p className="text-[#1F59EE] text-sm font-semibold">Total Issued</p>
                            <p className="text-[#1F59EE] text-[16px] font-bold">{voucherStats.totalIssued}</p>
                        </div>
                        <div className="flex flex-col gap-2 p-5 border border-[#E2E8F0] bg-[#F0FDF4] rounded-lg">
                            <p className="text-[#00813B] text-sm font-semibold">Redeemed</p>
                            <p className="text-[#00813B] text-[16px] font-bold">{voucherStats.totalRedeemed}</p>
                        </div>
                        <div className="flex flex-col gap-2 p-5 border border-[#E2E8F0] bg-[#FAF5FF] rounded-lg">
                            <p className="text-[#9810FA] text-sm font-semibold">Unredeemed</p>
                            <p className="text-[#9810FA] text-[16px] font-bold">{voucherStats.totalUnredeemed}</p>
                        </div>
                        <div className="flex flex-col gap-2 p-5 border border-[#E2E8F0] bg-[#FFF7ED] rounded-lg">
                            <p className="text-[#F55101] text-sm font-semibold">Redemption Rate</p>
                            <p className="text-[#F55101] text-[16px] font-bold">{voucherStats.redemptionRate}%</p>
                        </div>
                    </div>

                    {/* Simple Denomination Breakdown */}
                    <div className="mt-6 p-6  border border-[#E2E8F0] rounded-2xl">
                        <h3 className="text-[#353535] text-[16px] font-semibold mb-4">Denomination Breakdown</h3>
                        <div className="bg-white rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[16px] font-semibold text-[#1A1A1A]">Value</th>
                                        <th className="px-6 py-3 text-center text-[16px] font-semibold text-[#1A1A1A]">Issued</th>
                                        <th className="px-6 py-3 text-center text-[16px] font-semibold text-[#1A1A1A]">Redeemed</th>
                                        <th className="px-6 py-3 text-center text-[16px] font-semibold text-[#1A1A1A]">Unredeemed</th>
                                        <th className="px-6 py-3 text-center text-[16px] font-semibold text-[#1A1A1A]">Rate</th>
                                        <th className="px-6 py-3 text-center text-[16px] font-semibold text-[#1A1A1A]">Expires</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {voucherStats.denominationBreakdown.map((denom, index) => {
                                        const currSymbol = getCurrencySymbol(data[0]?.currency);
                                        const isExpanded = expandedDenominations.has(denom.value);

                                        return (
                                            <React.Fragment key={index}>
                                                <tr
                                                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm text-[#1A1A1A]">
                                                                {currSymbol} {denom.value?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[#1F59EE] font-semibold  text-sm">{denom.issued}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[#6BB577] font-semibold  text-sm">{denom.redeemed}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[#FA8F42] font-semibold  text-sm">{denom.unredeemed}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[#8728D8] font-semibold  text-sm">{denom.rate}%</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-center text-[#1A1A1A] text-sm">
                                                        {denom.expires ? new Date(denom.expires).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        }) : "No Expiry"}
                                                    </td>
                                                </tr>


                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col flex-1 min-h-0">
                {/* Filters */}
                <div className="p-4  items-center border-slate-200">
                    <h3 className="text-[#353535] text-[16px] font-semibold mb-4">Denomination Breakdown</h3>
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="relative w-full md:w-auto md:flex-1">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <SearchIcon />
                            </div>
                            <input
                                className="w-full placeholder-[#A6A6A6] text-black text-[12px] pl-11 pr-4 py-[11px] border border-gray-300 rounded-lg transition-all"
                                placeholder="Search by order ID, sender, or receiver..."
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <CustomDropdown
                                options={filterOptions}
                                placeholder="Status: All"
                                value={filters?.status || ""}
                                onChange={(value) => handleStatusFilter(value)}
                                className="min-w-[200px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1 px-2">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="sticky top-0">
                            <tr className="bg-[#EFEFEF]">
                                <th className="px-6 py-3 font-semibold text-[#1A1A1A] text-sm" scope="col">Order ID</th>
                                <th className="px-6 py-3 font-semibold text-[#1A1A1A] text-sm" scope="col">Sender</th>
                                <th className="px-6 py-3 font-semibold text-[#1A1A1A] text-sm" scope="col">Receiver</th>
                                <th className="px-6 py-3 font-semibold text-[#1A1A1A] text-sm" scope="col">Vouchers</th>
                                <th className="px-6 py-3 font-semibold text-[#1A1A1A] text-sm" scope="col">Status</th>
                                <th className="px-6 py-3 text-right font-semibold text-[#1A1A1A] text-sm" scope="col">Base Amount</th>
                                {/* <th className="px-6 py-3 text-right font-semibold" scope="col">Commission</th>
                                        <th className="px-6 py-3 text-right font-semibold" scope="col">VAT</th>
                                        <th className="px-6 py-3 text-right font-semibold" scope="col">Net Payable</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {data.length > 0 ? (
                                data.map((row) => {
                                    const currSymbol = getCurrencySymbol(row.currency);

                                    return (
                                        <tr key={row.id} className="bg-white hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-sm text-[#1A1A1A]">
                                                    {row.orderNumber}
                                                </div>
                                                <div className="text-xs text-[#1A1A1A] mt-1">
                                                    {new Date(row.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-sm text-[#1A1A1A]">
                                                    {row.senderName || 'N/A'}
                                                </div>
                                                <div className="text-xs text-[#1A1A1A] mt-1">
                                                    {row.senderEmail || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-sm text-[#1A1A1A]">
                                                    {row.receiverName || 'N/A'}
                                                </div>
                                               <div className="text-xs text-[#1A1A1A] mt-1">
                                                    {row.receiverEmail || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                               <div className="font-semibold text-sm text-[#1A1A1A]">
                                                    {row.totalVouchers} voucher{row.totalVouchers !== 1 ? 's' : ''}
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="text-xs text-[#1A1A1A]">
                                                        {row.redeemedVouchers} redeemed
                                                    </div>
                                                    <div className="text-xs text-[#10B981]">
                                                        {row.redemptionRate}% rate
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                 <div className="font-semibold text-sm text-[#1A1A1A]">
                                                    {currSymbol}{row.baseAmount?.toLocaleString()}
                                                </div>
                                                  <div className="text-xs text-[#1A1A1A] mt-1">
                                                    {row.settlementTrigger === 'onRedemption' ? 'Redeemed' : 'Sold'}
                                                </div>
                                            </td>
                                            {/* <td className="px-6 py-4 text-right whitespace-nowrap">
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
                                                    </td> */}
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
                {pagination.totalPages > 1 && (
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