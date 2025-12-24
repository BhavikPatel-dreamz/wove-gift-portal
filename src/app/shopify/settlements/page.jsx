// app/settlements/page.jsx - Updated to use optimized modal

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DynamicTable from "../../../components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSettlements, getSettlementTabData } from "../../../lib/action/brandPartner";
import SettlementDetailsModal from "../../../components/settlements/SettlementDetailsModal";
import { currencyList } from "../../../components/brandsPartner/currency";

const SettlementsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "";

  const params = useMemo(
    () => ({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
      frequency: searchParams.get("frequency") || "",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
    }),
    [searchParams]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSettlements(params);
      if (res.success) {
        setData(res.data);
        setPagination(res.pagination);
        setSummary(res.summary);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to fetch settlements");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    router.push(`?${newParams.toString()}`);
  };

  const handleSearch = (search) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("search", search);
    newParams.set("page", 1);
    router.push(`?${newParams.toString()}`);
  };

  const handleFilter = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    newParams.set("page", 1);
    router.push(`?${newParams.toString()}`);
  };

  const handleView = (row) => {
    setSelectedBrandId(row.brandId);
    setModalOpen(true);
  };

  const handleFetchTabData = async (brandId, tab) => {
    try {
      const res = await getSettlementTabData(brandId, tab);
      return res;
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
      toast.error(`Failed to load ${tab} data`);
      return { success: false, message: "Failed to fetch data" };
    }
  };

  const handleDownload = (row) => {
    toast.info(`Downloading CSV for: ${row.brandName}`);
  };

  const handleMarkPaid = (row) => {
    toast.success(`Marking as paid: ${row.brandName}`);
  };

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Starting Shopify data sync...");

    try {
      const response = await fetch("/api/sync-shopify", { method: "POST" });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(
          "Shopify data sync initiated. Data will be updated shortly.",
          { id: toastId }
        );
        setTimeout(() => {
          fetchData();
        }, 5000);
      } else {
        throw new Error(result.message || "Failed to sync Shopify data.");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during sync.",
        { id: toastId }
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    toast.info("Exporting all settlements...");
  };

  const columnHelper = createColumnHelper();

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: {
        icon: Clock,
        color: "text-amber-600 bg-amber-50 border-amber-200",
      },
      Paid: {
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200",
      },
      InReview: {
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50 border-red-200",
      },
      Disputed: {
        icon: AlertTriangle,
        color: "text-purple-600 bg-purple-50 border-purple-200",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}
      >
        <IconComponent className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const ActionButtons = ({ row }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleView(row.original)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDownload(row.original)}
        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        title="Download CSV"
      >
        <Download className="w-4 h-4" />
      </button>
      {row.original.status === "Pending" && (
        <button
          onClick={() => handleMarkPaid(row.original)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          Mark Paid
        </button>
      )}
    </div>
  );

  const customColumns = [
    columnHelper.accessor("brandName", {
      header: "Brand",
      cell: (info) => (
        <div className="flex items-center gap-3">
          {info.row.original.brandLogo && (
            <img
              src={info.row.original.brandLogo}
              alt={info.getValue()}
              className="w-8 h-8 rounded object-cover"
            />
          )}
          <div>
            <div className="font-semibold text-gray-900">{info.getValue()}</div>
            {info.row.original.settlementFrequency && (
              <div className="text-xs text-gray-500 capitalize">
                {info.row.original.settlementFrequency}
              </div>
            )}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("settlementPeriod", {
      header: "Period",
      cell: (info) => (
        <div className="text-sm">
          <div className="text-gray-900 font-medium">{info.getValue()}</div>
        </div>
      ),
    }),
    columnHelper.accessor("totalSoldAmount", {
      header: "Sold",
      cell: (info) => (
        <div>
          <div className="text-gray-900 font-semibold">
            {getCurrencySymbol(info.row.original.currency)}{info.getValue().toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {info.row.original.totalSold} vouchers
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("redeemedAmount", {
      header: "Redeemed",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <div className="text-green-700 font-semibold">
              {getCurrencySymbol(info.row.original.currency)}{info.getValue().toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              {row.redemptionRate}%
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("netPayable", {
      header: "Net Payable",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <div className="text-gray-900 font-bold">
              {getCurrencySymbol(info.row.original.currency)}{info.getValue().toLocaleString()}
            </div>
            {row.commissionAmount > 0 && (
              <div className="text-xs text-gray-500">
                Commission: {getCurrencySymbol(info.row.original.currency)}{row.commissionAmount.toLocaleString()}
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("remainingAmount", {
      header: "Outstanding",
      cell: (info) => {
        const amount = info.getValue();
        return (
          <div
            className={`font-semibold ${
              amount > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {getCurrencySymbol(info.row.original.currency)}{amount.toLocaleString()}
          </div>
        );
      },
    }),
    columnHelper.accessor("lastPaymentDate", {
      header: "Last Payment",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="text-sm">
            {info.getValue() ? (
              <>
                <div className="text-gray-900">
                  {new Date(info.getValue()).toLocaleDateString()}
                </div>
                {row.paymentCount > 1 && (
                  <div className="text-xs text-blue-600">
                    +{row.paymentCount - 1} more
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400">No payments</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionButtons row={row} />,
    }),
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Payable</span>
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {getCurrencySymbol(data && data[0]?.currency)}{summary.totalPayable.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalSettlements} settlements
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Paid</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {getCurrencySymbol(data && data[0]?.currency)}{summary.totalPaid.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.paidCount} completed
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {getCurrencySymbol(data && data[0]?.currency)}{summary.totalRemaining.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.pendingCount} pending
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {summary.totalSettlements > 0
                    ? ((summary.paidCount / summary.totalSettlements) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Payment completion
                </div>
              </div>
            </div>
          )}

          <DynamicTable
            data={data}
            columns={customColumns}
            loading={loading || syncing}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onFilter={handleFilter}
            title="Brand Settlements"
            subtitle="Monitor and manage brand settlement payments with comprehensive tracking"
            searchPlaceholder="Search by brand or settlement ID..."
            filters={[
              {
                name: "status",
                placeholder: "All Statuses",
                options: [
                  { value: "Pending", label: "Pending" },
                  { value: "Paid", label: "Paid" },
                  { value: "InReview", label: "In Review" },
                  { value: "Disputed", label: "Disputed" },
                ],
              },
              {
                name: "frequency",
                placeholder: "All Frequencies",
                options: [
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                ],
              },
            ]}
            actions={[
              {
                label: syncing ? "Syncing..." : "Sync Shopify",
                icon: RefreshCw,
                onClick: handleSync,
                disabled: syncing,
              },
              {
                label: "Export",
                icon: Download,
                onClick: handleExport,
              },
            ]}
            emptyMessage="No settlements found. Try adjusting your filters."
          />
        </div>
      </div>

      {/* Optimized Settlement Details Modal */}
      <SettlementDetailsModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBrandId(null);
        }}
        brandId={selectedBrandId}
        onFetchTabData={handleFetchTabData}
      />
    </>
  );
};

export default SettlementsPage;