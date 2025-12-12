"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Eye,
  Receipt,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import DynamicTable from "@/components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import Modal from "@/components/Modal";
import { getBrandSettlementHistory } from "../../../../../lib/action/brandPartner";

const BrandSettlementHistoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandInfo, setBrandInfo] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    year: "all",
    month: "all",
  });
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Generate year options
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return { value: year.toString(), label: year.toString() };
    });
  }, []);

  // Month options
  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);

      if (!id) {
        toast.error("Brand ID is missing");
        setLoading(false);
        return;
      }

      const params = {
        page: page.toString(),
        limit: "20",
      };

      if (filters.year !== "all") {
        if (filters.month !== "all") {
          params.filterMonth = `${filters.year}-${filters.month}`;
        } else {
          params.filterYear = filters.year;
        }
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const result = await getBrandSettlementHistory(id, params);

      if (result.success) {
        setData(result.data || []);
        setPagination(result.pagination || {});
        setBrandInfo(result.brandInfo);
      } else {
        toast.error(result.message || "Failed to fetch settlement history");
        setData([]);
        setPagination({});
        setBrandInfo(null);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("An error occurred while fetching settlement history");
      setData([]);
      setPagination({});
      setBrandInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, filters.status, filters.year, filters.month]);

  const handlePageChange = (page) => {
    fetchData(page);
  };

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleViewDetails = async (settlement) => {
    router.push(`/brandsPartner/${id}/settlements/${settlement.id}/overview`);
  };

  const handleViewPayments = (settlement) => {
    setSelectedSettlement(settlement);
    setPaymentModalOpen(true);
  };

  const handleExport = () => {
    toast.info("Export feature coming soon...");
  };

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
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}
      >
        <IconComponent className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    const currency = brandInfo?.currency || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ActionButtons = ({ row }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleViewDetails(row.original)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      {row.original.paymentCount > 0 && (
        <button
          onClick={() => handleViewPayments(row.original)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="View Payments"
        >
          <Receipt className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const columnHelper = createColumnHelper();

  const customColumns = [
    columnHelper.accessor("settlementPeriod", {
      header: "PERIOD",
      cell: (info) => (
        <div className="font-semibold text-gray-900">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("totalSold", {
      header: "SOLD",
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">
            {formatCurrency(info.row.original.baseAmount)}
          </div>
          <div className="text-xs text-gray-500">{info.getValue()} Units</div>
        </div>
      ),
    }),
    columnHelper.accessor("totalRedeemed", {
      header: "REDEEMED",
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">
            {formatCurrency(info.row.original.baseAmount * (info.row.original.redemptionRate / 100))}
          </div>
          <div className="text-xs text-gray-500">
            {info.getValue()} • {info.row.original.redemptionRate}%
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("netPayable", {
      header: "NET PAYABLE",
      cell: (info) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor("remainingAmount", {
      header: "OUTSTANDING",
      cell: (info) => (
        <div
          className={`font-medium ${
            info.getValue() > 0 ? "text-amber-600" : "text-green-600"
          }`}
        >
          {formatCurrency(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      header: "LAST PAYMENT",
      cell: (info) => (
        <div className="text-gray-700">{formatDate(info.getValue())}</div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <ActionButtons row={row} />,
    }),
  ];

  const statusFilterOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
    { value: "PartiallyPaid", label: "Partially Paid" },
    { value: "InReview", label: "In Review" },
    { value: "Disputed", label: "Disputed" },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Brand Info */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/settlements")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Settlements
          </button>
        </div>

        {/* DynamicTable Component */}
        <DynamicTable
          data={data}
          columns={customColumns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          title="Brand History"
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
              placeholder: "Frequency: All",
              options: yearOptions,
            },
          ]}
          actions={[
            {
              label: "Sort: Latest First",
              onClick: () => toast.info("Sorting feature coming soon"),
            },
          ]}
          customFilters={
            <div className="flex gap-2">
              <select
                value={filters.year}
                onChange={(e) => handleFilter("year", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Years</option>
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {filters.year !== "all" && (
                <select
                  value={filters.month}
                  onChange={(e) => handleFilter("month", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Months</option>
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          }
          emptyMessage="No settlement history found. Try adjusting your filters."
        />

        {/* Settlement Details Modal */}
        <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)}>
          {selectedSettlement && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Settlement Details
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedSettlement.settlementPeriod}
              </p>

              <div className="space-y-6">
                {/* Transaction Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Transaction Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Sold</div>
                      <div className="font-semibold text-gray-900">
                        {selectedSettlement.totalSold}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Redeemed</div>
                      <div className="font-semibold text-gray-900">
                        {selectedSettlement.totalRedeemed}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Rate</div>
                      <div className="font-semibold text-gray-900">
                        {selectedSettlement.redemptionRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Outstanding</div>
                      <div className="font-semibold text-gray-900">
                        {selectedSettlement.outstanding}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Financial Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Amount</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedSettlement.baseAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(selectedSettlement.commissionAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT</span>
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(selectedSettlement.vatAmount)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">
                          Net Payable
                        </span>
                        <span className="font-bold text-green-700">
                          {formatCurrency(selectedSettlement.netPayable)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailsModalOpen(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </Modal>

        {/* Payment History Modal */}
        <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}>
          {selectedSettlement && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Payment History
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedSettlement.settlementPeriod}
              </p>

              <div className="space-y-4">
                {selectedSettlement.paymentHistory?.length > 0 ? (
                  selectedSettlement.paymentHistory.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="font-semibold">Payment #{index + 1}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(payment.paidAt)}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                      {payment.reference && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Ref:</span> {payment.reference}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No payments recorded yet</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setPaymentModalOpen(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default BrandSettlementHistoryPage;