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
import { getSettlementDetailsByBrandId, getSettlements } from "../../../lib/action/brandPartner";
import SettlementDetailsModal from "../../../components/settlements/SettlementDetailsModal";
import { currencyList } from "../../../components/brandsPartner/currency";

const SettlementsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
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
        console.log(res.data);
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

  const handleView = async (row) => {
    setModalLoading(true);
    try {
      const res = await getSettlementDetailsByBrandId(row.brandId);
      if (res.success) {
        setSelectedSettlement(res.data);
        setModalOpen(true);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to load settlement details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewPayments = (row) => {
    setSelectedSettlement(row);
    setPaymentModalOpen(true);
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
        disabled={modalLoading}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      {row.original.paymentCount > 0 && (
        <button
          onClick={() => handleViewPayments(row.original)}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="View Payments"
        >
          <CreditCard className="w-4 h-4" />
        </button>
      )}
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

      {/* Settlement Details Modal */}
      <SettlementDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedSettlement}
        loading={modalLoading}
      />

      {/* Payment History Modal */}
      {paymentModalOpen && selectedSettlement && (
        <PaymentHistoryModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          settlement={selectedSettlement}
        />
      )}
    </>
  );
};

// Payment History Modal Component
const PaymentHistoryModal = ({ isOpen, onClose, settlement }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">Payment History</h3>
                  <p className="text-purple-100 text-sm">{settlement.brandName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-purple-500 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Total Payable</div>
                <div className="text-2xl font-bold text-blue-700">
                  {getCurrencySymbol(data && data[0]?.currency)}{settlement.netPayable.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Total Paid</div>
                <div className="text-2xl font-bold text-green-700">
                  {getCurrencySymbol(data && data[0]?.currency)}{settlement.totalPaid.toLocaleString()}
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-sm text-amber-600 mb-1">Remaining</div>
                <div className="text-2xl font-bold text-amber-700">
                  {getCurrencySymbol(data && data[0]?.currency)}{settlement.remainingAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Payment List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">
                Payment Transactions ({settlement.paymentCount})
              </h4>
              {settlement.paymentHistory && settlement.paymentHistory.length > 0 ? (
                settlement.paymentHistory.map((payment, idx) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Payment #{idx + 1}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.paidAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {getCurrencySymbol(data && data[0]?.currency)}{payment.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                    </div>
                    {payment.reference && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500">Reference</div>
                        <div className="text-sm font-mono text-gray-900">
                          {payment.reference}
                        </div>
                      </div>
                    )}
                    {payment.notes && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">Notes</div>
                        <div className="text-sm text-gray-700">{payment.notes}</div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payment history available
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementsPage;