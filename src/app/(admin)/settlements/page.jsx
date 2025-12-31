"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Download,
  TrendingUp,
  DollarSign,
  CreditCard,
  FileText,
  Calendar,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSettlements } from "../../../lib/action/brandPartner";

const SettlementsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState(null);
  const [filterInfo, setFilterInfo] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return { value: year.toString(), label: year.toString() };
    });
  }, []);

  const params = useMemo(
    () => ({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
      frequency: searchParams.get("frequency") || "",
      filterMonth: searchParams.get("filterMonth") || null,
      filterYear: searchParams.get("filterYear") || null,
    }),
    [searchParams]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getSettlements(params);
      if (response.success) {
        setData(response.data);
        setPagination(response.pagination);
        setSummary(response.summary);
        setFilterInfo(response.filters);
      } else {
        toast.error(response.message || "Failed to fetch settlements");
      }
    } catch (error) {
      toast.error("An error occurred while fetching settlements");
      console.error("Fetch settlements error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    router.push(`?${newParams.toString()}`);
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set("search", search);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", 1);
    router.push(`?${newParams.toString()}`);
  };

  const handleFilter = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
      if (name === "filterMonth" && value) {
        newParams.delete("filterYear");
      } else if (name === "filterYear" && value) {
        newParams.delete("filterMonth");
      }
    } else {
      newParams.delete(name);
    }
    newParams.set("page", 1);
    router.push(`?${newParams.toString()}`);
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set("page", 1);
    newParams.set("limit", searchParams.get("limit") || 10);
    router.push(`?${newParams.toString()}`);
  };

  const handleView = (row) => {
    router.push(`/settlements/${row.id}/overview`);
  };

  const handleViewPayments = (row) => {
    setSelectedSettlement(row);
    setPaymentModalOpen(true);
  };

  const handleViewDetails = (row) => {
    setSelectedSettlement(row);
    setDetailsModalOpen(true);
  };

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Starting Shopify data sync...");

    try {
      const response = await fetch("/api/sync-shopify", { method: "POST" });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Shopify data sync initiated.", { id: toastId });
        setTimeout(() => fetchData(), 5000);
      } else {
        throw new Error(result.message || "Failed to sync Shopify data.");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(error instanceof Error ? error.message : "Sync failed", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const columnHelper = createColumnHelper();

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
      Paid: { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200" },
      PartiallyPaid: { icon: AlertTriangle, color: "text-blue-600 bg-blue-50 border-blue-200" },
      InReview: { icon: AlertTriangle, color: "text-red-600 bg-red-50 border-red-200" },
      Disputed: { icon: AlertTriangle, color: "text-purple-600 bg-purple-50 border-purple-200" },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const columns = [
    columnHelper.accessor("brandName", {
      header: "Brand",
      cell: (info) => (
        <div className="flex items-center gap-3">
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
      cell: (info) => <div className="text-sm text-gray-900 font-medium">{info.getValue()}</div>,
    }),
    columnHelper.accessor("baseAmount", {
      header: "Base Amount",
      cell: (info) => (
        <div>
          <div className="text-gray-900 font-bold">${info.getValue()?.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {info.row.original.settlementTrigger === 'onRedemption' ? 'Redeemed' : 'Sold'}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("commissionAmount", {
      header: "Commission",
      cell: (info) => (
        <div>
          <div className="text-orange-600 font-bold">-${info.getValue()?.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {info.row.original.commissionType === 'Percentage' 
              ? `${info.row.original.commissionValue}%` 
              : 'Fixed'}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("vatAmount", {
      header: "VAT",
      cell: (info) => (
        <div>
          <div className="text-purple-600 font-bold">+${info.getValue()?.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{info.row.original.vatRate}% on comm.</div>
        </div>
      ),
    }),
    columnHelper.accessor("netPayable", {
      header: "Net Payable",
      cell: (info) => (
        <div>
          <div className="text-gray-900 font-bold text-base">${info.getValue()?.toLocaleString()}</div>
          <div className="text-xs text-green-600">Final amount</div>
        </div>
      ),
    }),
    columnHelper.accessor("remainingAmount", {
      header: "Outstanding",
      cell: (info) => {
        const amount = info.getValue();
        return (
          <div className={`font-semibold ${amount > 0 ? "text-red-600" : "text-green-600"}`}>
            ${amount?.toLocaleString()}
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetails(row.original)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Calculation Details"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleView(row.original)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="View Full Details"
          >
            <ArrowRight className="w-4 h-4" />
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
        </div>
      ),
    }),
  ];

  const hasActiveFilters = params.filterMonth || params.filterYear || params.status || params.frequency || params.search;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Settlements</h1>
              <p className="text-gray-600 mt-1">
                Showing data for: <span className="font-semibold text-blue-600">{filterInfo?.period || 'Loading...'}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Shopify'}
              </button>
              <button
                onClick={() => toast.info("Export feature coming soon...")}
                className="flex items-center gap-2 px-4 py-2 text-black  bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm border p-6 text-black">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={params.search}
                  onChange={handleSearch}
                  placeholder="Brand or settlement ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                <select
                  value={params.filterMonth || ""}
                  onChange={(e) => handleFilter("filterMonth", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Last Month (Default)</option>
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
                <select
                  value={params.filterYear || ""}
                  onChange={(e) => handleFilter("filterYear", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!!params.filterMonth}
                >
                  <option value="">All Year</option>
                  {yearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={params.status || ""}
                  onChange={(e) => handleFilter("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="PartiallyPaid">Partially Paid</option>
                  <option value="InReview">In Review</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={params.frequency || ""}
                  onChange={(e) => handleFilter("frequency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Frequencies</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Payable</span>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${summary.totalPayable?.toLocaleString()}
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
                ${summary.totalPaid?.toLocaleString()}
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
                ${summary.totalRemaining?.toLocaleString()}
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
              <div className="text-xs text-gray-500 mt-1">Payment completion</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No settlements found</p>
              <p className="text-sm mt-2">Try adjusting your filters or select a different time period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.id || col.accessorKey}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col.id || col.accessorKey} className="px-6 py-4">
                          {col.cell({ row: { original: row }, getValue: () => row[col.accessorKey] })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                {pagination.totalItems} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailsModalOpen && selectedSettlement && (
        <CalculationDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          settlement={selectedSettlement}
        />
      )}

      {paymentModalOpen && selectedSettlement && (
        <PaymentHistoryModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          settlement={selectedSettlement}
        />
      )}
    </div>
  );
};

const CalculationDetailsModal = ({ isOpen, onClose, settlement }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">Calculation Breakdown</h3>
                  <p className="text-blue-100 text-sm">{settlement.brandName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Settlement Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Period:</span>
                  <div className="font-medium text-gray-900">{settlement.settlementPeriod}</div>
                </div>
                <div>
                  <span className="text-gray-600">Trigger:</span>
                  <div className="font-medium text-gray-900">
                    {settlement.settlementTrigger === 'onRedemption' ? 'On Redemption' : 'On Purchase'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Base Amount</div>
                  <div className="text-xs text-blue-500 mt-1">
                    {settlement.settlementTrigger === 'onRedemption' ? 'Total Redeemed' : 'Total Sold'}
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  ${settlement.baseAmount?.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex-1">
                  <div className="text-sm text-orange-600 font-medium">Commission</div>
                  <div className="text-xs text-orange-500 mt-1">
                    {settlement.commissionType === 'Percentage' 
                      ? `$${settlement.baseAmount?.toLocaleString()} × ${settlement.commissionValue}% ÷ 100`
                      : `Fixed: $${settlement.commissionValue}`}
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  -${settlement.commissionAmount?.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex-1">
                  <div className="text-sm text-purple-600 font-medium">VAT on Commission</div>
                  <div className="text-xs text-purple-500 mt-1">
                    ${settlement.commissionAmount?.toLocaleString()} × {settlement.vatRate}% ÷ 100
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  +${settlement.vatAmount?.toLocaleString()}
                </div>
              </div>

              <div className="h-px bg-gray-300"></div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-500">
                <div>
                  <div className="text-sm text-green-600 font-medium">Net Payable</div>
                  <div className="text-xs text-green-500 mt-1">Base - Commission + VAT</div>
                </div>
                <div className="text-3xl font-bold text-green-700">
                  ${settlement.netPayable?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment History Modal Component
const PaymentHistoryModal = ({ isOpen, onClose, settlement }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">Payment History</h3>
                  <p className="text-purple-100 text-sm">{settlement.brandName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-purple-500 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Total Payable</div>
                <div className="text-2xl font-bold text-blue-700">
                  ${settlement.netPayable.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Total Paid</div>
                <div className="text-2xl font-bold text-green-700">
                  ${settlement.totalPaid.toLocaleString()}
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-sm text-amber-600 mb-1">Remaining</div>
                <div className="text-2xl font-bold text-amber-700">
                  ${settlement.remainingAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">
                Payment Transactions ({settlement.paymentCount})
              </h4>
              {settlement.paymentHistory && settlement.paymentHistory.length > 0 ? (
                settlement.paymentHistory.map((payment, idx) => (
                  <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Payment #{idx + 1}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.paidAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${payment.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                    </div>
                    {payment.reference && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500">Reference</div>
                        <div className="text-sm font-mono text-gray-900">{payment.reference}</div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No payment history available</div>
              )}
            </div>
          </div>

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