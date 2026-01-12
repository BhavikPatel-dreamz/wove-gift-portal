"use client";

import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Receipt, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import DynamicTable from "@/components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { currencyList } from "../brandsPartner/currency";
import Link from "next/link";

const BrandSettlementHistoryClient = ({
    brandId,
    initialData,
    initialPagination,
    brandInfo,
    error,
}) => {
    const router = useRouter();

    // Generate year options
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => {
            const year = currentYear - i;
            return { value: year.toString(), label: year.toString() };
        });
    }, []);

    const statusFilterOptions = useMemo(
        () => [
            { value: "Pending", label: "Pending" },
            { value: "Paid", label: "Paid" },
            { value: "PartiallyPaid", label: "Partially Paid" },
            { value: "InReview", label: "In Review" },
            { value: "Disputed", label: "Disputed" },
        ],
        []
    );

    const sortOptions = useMemo(
        () => [
            { value: "periodStart_desc", label: "Latest First" },
            { value: "periodStart_asc", label: "Oldest First" },
        ],
        []
    );

    const formatCurrency = useCallback(
        (amount) => {
            const currency = brandInfo?.currency || "USD";
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount || 0);
        },
        [brandInfo?.currency]
    );

    const formatDate = useCallback((date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, []);

    const handlePageChange = useCallback(
        (page) => {
            const params = new URLSearchParams(window.location.search);
            params.set("page", page.toString());
            router.push(`?${params.toString()}`);
        },
        [router]
    );

    const handleFilter = useCallback(
        (name, value) => {
            const params = new URLSearchParams(window.location.search);
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            params.set("page", "1"); // Reset to first page on filter
            router.push(`?${params.toString()}`);
        },
        [router]
    );

    const handleSearch = useCallback(
        (search) => {
            const params = new URLSearchParams(window.location.search);
            if (search) {
                params.set("search", search);
            } else {
                params.delete("search");
            }
            params.set("page", "1");
            router.push(`?${params.toString()}`);
        },
        [router]
    );

    const handleViewDetails = useCallback(
        (settlement) => {
            router.push(`/brandsPartner/${brandId}/settlements/${settlement.id}/overview`);
        },
        [router, brandId]
    );

    console.log("initialData", initialData);

    const getCurrencySymbol = (code) =>
        currencyList.find((c) => c.code === code)?.symbol || "$";



    const StatusBadge = useMemo(
        () =>
            ({ status , row}) => {
                const statusConfig = {
                    Pending: {
                        icon: Clock,
                        color: "text-amber-600 bg-amber-50 border-amber-200",
                    },
                    Paid: {
                        icon: CheckCircle,
                        color: "text-green-600 bg-green-50 border-green-200",
                    },
                    PartiallyPaid: {
                        icon: AlertTriangle,
                        color: "text-blue-600 bg-blue-50 border-blue-200",
                    },
                    InReview: {
                        icon: AlertTriangle,
                        color: "text-orange-600 bg-orange-50 border-orange-200",
                    },
                    Disputed: {
                        icon: AlertTriangle,
                        color: "text-red-600 bg-red-50 border-red-200",
                    },
                };

                const config = statusConfig[status] || statusConfig.Pending;
                const IconComponent = config.icon;

                return (
                    <div className="inline-flex items-center gap-1.5">
                        <Link
                            href={`/brandsPartner/${brandId}/settlements/${row.id}/overview`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Overview"
                            aria-label="View Overview"
                        >
                        <Eye className="w-5 h-5" />
                        </Link>
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}
                        >
                            <IconComponent className="w-3.5 h-3.5" />
                            {status}
                        </span>
                    </div>
                );
            },
        []
    );

    const ActionButtons = useMemo(
        () =>
            ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleViewDetails(row.original)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                        aria-label="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {row.original.paymentCount > 0 && (
                        <button
                            onClick={() =>
                                router.push(
                                    `/brandsPartner/${brandId}/settlements/${row.original.id}/payments`
                                )
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Payments"
                            aria-label="View Payments"
                        >
                            <Receipt className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        [handleViewDetails, router, brandId]
    );

    const columnHelper = createColumnHelper();

    function formatDateRange(input) {
        const monthMap = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04',
            May: '05', Jun: '06', Jul: '07', Aug: '08',
            Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };

        const [start, end] = input.split(' - ');

        const format = (dateStr) => {
            const [month, day, year] = dateStr.replace(',', '').split(' ');
            return `${day.padStart(2, '0')}/${monthMap[month]}/${year}`;
        };

        return `${format(start)}-${format(end)}`;
    }


    const customColumns = useMemo(
        () => [
            columnHelper.accessor("settlementPeriod", {
                header: "PERIOD",
                cell: (info) => (
                    <div className="font-semibold text-[#1A1A1A]">{formatDateRange(info.getValue())}</div>
                ),
            }),
            columnHelper.accessor("totalSold", {
                header: "SOLD",
                cell: (info) => (
                    <div>
                        <div className="font-semibold text-[#1A1A1A]">
                            {formatCurrency(info.row.original.baseAmount)}
                        </div>
                        <div className="text-xs text-gray-500">{info.getValue()} Units</div>
                    </div>
                ),
            }),
            columnHelper.accessor("totalRedeemed", {
                header: "REDEEMED",
                cell: (info) => {
                    const redeemedAmount =
                        info.row.original.baseAmount *
                        (info.row.original.redemptionRate / 100);
                    return (
                        <div>
                            <div className="font-semibold text-[#1A1A1A]">
                                {formatCurrency(redeemedAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {info.getValue()} • {info.row.original.redemptionRate}%
                            </div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor("netPayable", {
                header: "Net Payable",
                cell: (info) => (
                    <div>
                        <div className="text-[#1A1A1A] font-semibold text-xs">{getCurrencySymbol(info.row.original.currency)}{info.getValue()?.toLocaleString()}</div>
                        <div className="text-xs text-[#64748B] ">
                            -{info.row.original.commissionType === 'Percentage'
                                ? `${info.row.original.commissionValue}%`
                                : 'Fixed'} Commission on Base Amount
                        </div>
                        <div className="text-xs text-gray-500">+{info.row.original.vatRate}% VAT on Commission</div>
                    </div>
                ),
            }),
            columnHelper.accessor("remainingAmount", {
                header: "OUTSTANDING",
                cell: (info) => (
                    <div className="font-semibold text-[#1A1A1A]">
                        {formatCurrency(info.getValue())}
                    </div>
                ),
            }),
            columnHelper.accessor("updatedAt", {
                header: "LAST PAYMENT",
                cell: (info) => (
                    <div className="font-semibold text-[#1A1A1A]">
                        {formatDate(info.getValue())}
                    </div>
                ),
            }),
            columnHelper.accessor("status", {
                header: "STATUS",
                cell: (info) => <StatusBadge status={info.getValue()} row={info.row.original} />,
            }),
            //   columnHelper.display({
            //     id: "actions",
            //     header: "",
            //     cell: ({ row }) => <ActionButtons row={row} />,
            //   }),
        ],
        [columnHelper, formatCurrency, formatDate, StatusBadge, ActionButtons]
    );

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-8xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="rounded-lg bg-red-50 p-6">
                                <svg
                                    className="mx-auto h-12 w-12 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="mt-4 text-base font-medium text-red-800">
                                    Failed to load settlement history
                                </p>
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-8xl mx-auto">
                <DynamicTable
                    data={initialData}
                    columns={customColumns}
                    loading={false}
                    pagination={initialPagination}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    title={`${brandInfo?.name || "Brand"} History`}
                    subtitle="Monitor and manage brand settlements"
                    searchPlaceholder="Search by code, user email or status"
                    filters={[
                        {
                            name: "status",
                            placeholder: "Status: All",
                            options: statusFilterOptions,
                        },
                        {
                            name: "year",
                            placeholder: "Year: All",
                            options: yearOptions,
                        },
                        {
                            name: "sortby",
                            placeholder: "Sort By: Latest First",
                            options: sortOptions,
                        },
                    ]}
                    emptyMessage="No settlement history found. Try adjusting your filters."
                />
            </div>
        </div>
    );
};

export default BrandSettlementHistoryClient;