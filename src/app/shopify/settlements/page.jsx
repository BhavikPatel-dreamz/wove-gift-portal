"use client";

import React, { useMemo, useCallback, useState, useEffect, useTransition } from "react";
import { useSearchParams, useParams, usePathname } from "next/navigation";
import { Eye, Receipt, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import DynamicTable from "@/components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { currencyList } from "../../../components/brandsPartner/currency";
import { getBrandSettlementHistory } from "../../../lib/action/brandPartner";
import { useShopifyNavigation } from '@/hooks/useShopifyNavigation';

const BrandSettlementHistoryClient = () => {
    const [initialData, setInitialData] = useState([]);
    const [initialPagination, setInitialPagination] = useState({});
    const [brandInfo, setBrandInfo] = useState(null);
    const [brandId, setBrandId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams();
    const { navigate } = useShopifyNavigation();

    const urlBrandId = params.id;
    const shop = searchParams.get('shop');

    // Get filter values from URL params (not local state)
    const currentPage = searchParams.get('page') || '1';
    const currentStatus = searchParams.get('status') || '';
    const currentYear = searchParams.get('year') || '';
    const currentSortBy = searchParams.get('sortby') || '';
    const currentSearch = searchParams.get('search') || '';

    const fetchBrandSettlementHistory = useCallback(async () => {
        try {
            setLoading(true);

            // Build query params from URL search params
            const queryParams = {
                page: currentPage,
                limit: "20",
            };

            // Add brandId if available from URL params
            if (urlBrandId) {
                queryParams.brandId = urlBrandId;
            }

            // Add shop if available from query params
            if (shop) {
                queryParams.shop = shop;
            }

            // Handle year filter
            if (currentYear && currentYear !== "all") {
                queryParams.filterYear = currentYear;
            }

            // Handle status filter
            if (currentStatus && currentStatus !== "all") {
                queryParams.status = currentStatus;
            }

            // Handle search
            if (currentSearch) {
                queryParams.search = currentSearch;
            }

            // Handle sorting
            if (currentSortBy) {
                const [sortBy, sortOrder] = currentSortBy.split("_");
                queryParams.sortBy = sortBy || "periodStart";
                queryParams.sortOrder = sortOrder || "desc";
            } else {
                queryParams.sortBy = "periodStart";
                queryParams.sortOrder = "desc";
            }

            console.log('Fetching with params:', queryParams);

            // Fetch data
            const result = await getBrandSettlementHistory(urlBrandId, queryParams, shop);

            if (result.success) {
                setInitialData(result.data || []);
                setInitialPagination(result.pagination || {});
                setBrandInfo(result.brandInfo || null);
                setBrandId(result.brandId || urlBrandId);
                setError(null);
            } else {
                setError(result.message || 'Failed to load settlement history');
            }
        } catch (err) {
            console.error('Error fetching settlement history:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, [urlBrandId, shop, currentPage, currentStatus, currentYear, currentSortBy, currentSearch]);

    useEffect(() => {
        if (urlBrandId || shop) {
            fetchBrandSettlementHistory();
        }
    }, [fetchBrandSettlementHistory]);

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

    // Unified URL change handler using Shopify App Bridge
    const handleUrlChange = useCallback(
        (newParams) => {
            const newUrl = `${pathname}?${newParams.toString()}`;
            console.log('Navigation - New URL:', newUrl);

            startTransition(() => {
                navigate(newUrl);
            });
        },
        [navigate, pathname]
    );

    const handlePageChange = useCallback(
        (page) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", page.toString());

            if (shop) {
                params.set("shop", shop);
            }

            handleUrlChange(params);
        },
        [searchParams, shop, handleUrlChange]
    );

    const handleFilter = useCallback(
        (name, value) => {
            const params = new URLSearchParams(searchParams.toString());

            if (value && value !== "all") {
                params.set(name, value);
            } else {
                params.delete(name);
            }

            params.set("page", "1");

            if (shop) {
                params.set("shop", shop);
            }

            handleUrlChange(params);
        },
        [searchParams, shop, handleUrlChange]
    );

    const handleSearch = useCallback(
        (search) => {
            const params = new URLSearchParams(searchParams.toString());

            if (search) {
                params.set("search", search);
            } else {
                params.delete("search");
            }

            params.set("page", "1");

            if (shop) {
                params.set("shop", shop);
            }

            handleUrlChange(params);
        },
        [searchParams, shop, handleUrlChange]
    );

    const handleViewDetails = useCallback(
        (settlement) => {
            if (brandId) {
                const params = new URLSearchParams();
                if (shop) {
                    params.set('shop', shop);
                }
                const queryString = params.toString();
                const url = `/brandsPartner/${brandId}/settlements/${settlement.id}/overview${queryString ? `?${queryString}` : ''}`;
                navigate(url);
            }
        },
        [navigate, brandId, shop]
    );

    const getCurrencySymbol = useCallback((code) =>
        currencyList.find((c) => c.code === code)?.symbol || "$",
        []);

    function formatDateRange(input) {
        if (!input || typeof input !== 'string') return 'N/A';

        const monthMap = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04',
            May: '05', Jun: '06', Jul: '07', Aug: '08',
            Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };

        try {
            const parts = input.split(' - ');
            if (parts.length !== 2) return input;

            const [start, end] = parts;

            const format = (dateStr) => {
                if (!dateStr) return '';
                const cleanDateStr = dateStr.replace(',', '').trim();
                const dateParts = cleanDateStr.split(' ');
                if (dateParts.length !== 3) return dateStr;

                const [month, day, year] = dateParts;
                const dayPadded = String(day).padStart(2, '0');
                return `${dayPadded}/${monthMap[month] || '00'}/${year}`;
            };

            return `${format(start)} - ${format(end)}`;
        } catch (error) {
            console.error('Error formatting date range:', error);
            return input;
        }
    }

    const StatusBadge = useMemo(
        () =>
            ({ status, row }) => {
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

                const getLinkHref = () => {
                    const params = new URLSearchParams();
                    if (shop) {
                        params.set('shop', shop);
                    }
                    const queryString = params.toString();
                    return `/brandsPartner/${brandId}/settlements/${row.id}/overview${queryString ? `?${queryString}` : ''}`;
                };

                return (
                    <div className="inline-flex items-center gap-1.5">
                        {brandId && (
                            <Link
                                href={getLinkHref()}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Overview"
                                aria-label="View Overview"
                            >
                                <Eye className="w-5 h-5" />
                            </Link>
                        )}
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}
                        >
                            <IconComponent className="w-3.5 h-3.5" />
                            {status}
                        </span>
                    </div>
                );
            },
        [brandId, shop]
    );

    const columnHelper = createColumnHelper();

    const customColumns = useMemo(
        () => [
            columnHelper.accessor("settlementPeriod", {
                header: "PERIOD",
                cell: (info) => (
                    <div className="font-semibold text-[#1A1A1A] text-xs">
                        {formatDateRange(info.getValue())}
                    </div>
                ),
            }),
            columnHelper.accessor((row) => {
                return row.settlementTrigger === "onRedemption"
                    ? row.redeemedAmount
                    : row.totalSoldAmount;
            }, {
                id: "baseAmount",
                header: "BASE AMOUNT",
                cell: (info) => {
                    const row = info.row.original;
                    const baseAmount = info.getValue() || 0;
                    const trigger = row.settlementTrigger || row.brandTerms?.settlementTrigger;

                    return (
                        <div>
                            <div className="font-semibold text-[#1A1A1A]">
                                {getCurrencySymbol(row.currency)}
                                {baseAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                                {row.totalSold || 0} Units • {trigger === "onRedemption" ? "Redeemed" : "Sold"}
                            </div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor("totalRedeemed", {
                header: "REDEEMED",
                cell: (info) => {
                    const row = info.row.original;
                    const redeemedAmount = row.redeemedAmount || 0;

                    return (
                        <div>
                            <div className="font-semibold text-[#1A1A1A]">
                                {getCurrencySymbol(row.currency)}
                                {redeemedAmount.toLocaleString()}
                            </div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor("netPayable", {
                header: "NET PAYABLE",
                cell: (info) => {
                    const row = info.row.original;
                    const netPayable = info.getValue() || 0;
                    const commissionType = row.brandTerms?.commissionType;
                    const commissionValue = row.brandTerms?.commissionValue || 0;
                    const vatRate = row.vatRate || row.brandTerms?.vatRate || 0;
                    const commissionAmount = row.commissionAmount || 0;
                    const vatAmount = row.vatAmount || 0;

                    return (
                        <div className="space-y-0.5">
                            <div className="text-[#1A1A1A] font-semibold">
                                {getCurrencySymbol(row.currency)}
                                {netPayable.toLocaleString()}
                            </div>
                            {commissionAmount >= 1 && commissionType && (
                                <div className="text-xs text-red-600">
                                    -{commissionValue}% Commission on Base Amount
                                </div>
                            )}
                            {vatRate >= 1 && vatAmount >= 1 && (
                                <div className="text-xs text-green-600">
                                    +{vatRate}% VAT on Commission
                                </div>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor("remainingAmount", {
                header: "OUTSTANDING",
                cell: (info) => {
                    const amount = info.getValue() || 0;
                    const row = info.row.original;
                    const totalPaid = row.totalPaid || 0;

                    const isFullyPaid = amount === 0 && totalPaid > 0;
                    const hasOutstanding = amount > 0;

                    return (
                        <div>
                            <div className={`font-semibold ${isFullyPaid ? 'text-green-600' : hasOutstanding ? 'text-orange-600' : 'text-gray-900'}`}>
                                {getCurrencySymbol(row.currency)}
                                {amount.toLocaleString()}
                            </div>
                            {totalPaid > 0 && (
                                <div className="text-xs text-[#64748B]">
                                    Paid: {getCurrencySymbol(row.currency)}
                                    {totalPaid.toLocaleString()}
                                </div>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor("lastPaymentDate", {
                header: "LAST PAYMENT",
                cell: (info) => {
                    const row = info.row.original;
                    return (
                        <div className="text-sm">
                            {info.getValue() ? (
                                <>
                                    <div className="text-[#1A1A1A] font-semibold text-xs">
                                        {formatDate(info.getValue())}
                                    </div>
                                    {row.paymentCount > 1 && (
                                        <div className="text-xs text-blue-600">
                                            +{row.paymentCount - 1} more
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-400 text-xs">No payments</span>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor("status", {
                header: "STATUS",
                cell: (info) => <StatusBadge status={info.getValue()} row={info.row.original} />,
            }),
        ],
        [columnHelper, getCurrencySymbol, formatDate, StatusBadge]
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-8xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading settlement history...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

    console.log(currentSearch, "currentSearch")

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
                    title={`${brandInfo?.name || "Brand"} Settlement History`}
                    subtitle="Monitor and manage brand settlements"
                    searchPlaceholder="Search by settlement ID or period"
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