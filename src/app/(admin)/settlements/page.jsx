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
import DynamicTable from "../../../components/forms/DynamicTable";
import { currencyList } from "../../../components/brandsPartner/currency";
import { Eye } from "lucide-react";

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
  const [processModalOpen, setProcessModalOpen] = useState(false);


  const searchParams = useSearchParams();
  const router = useRouter();

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "$";


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

  console.log("data", data);

   const openProcessModal = (settlement) => {
    setSelectedSettlement(settlement);
    setProcessModalOpen(true);
  };


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
            <div className="font-semibold text-[#1A1A1A] ">{info.getValue()}</div>
            {info.row.original.settlementFrequency && (
              <div className="text-xs text-[#64748B] capitalize">
                {info.row.original.settlementFrequency}
              </div>
            )}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("settlementPeriod", {
      header: "Period",
      cell: (info) => <div className="text-xs text-[#1A1A1A] font-semibold">{info.getValue()}</div>,
    }),
    columnHelper.accessor("baseAmount", {
      header: "Base Amount",
      cell: (info) => (
        <div>
          <div className="text-[#1A1A1A] font-semibold">{getCurrencySymbol(info.row.original.currency) + "" + info.getValue()?.toLocaleString()}</div>
          <div className="text-xs text-[#64748B] ">
            {info.row.original.settlementTrigger === 'onRedemption' ? 'Redeemed' : 'Sold'}
          </div>
        </div>
      ),
    }),
    // columnHelper.accessor("commissionAmount", {
    //   header: "Commission",
    //   cell: (info) => (
    //     <div>
    //       <div className="text-orange-600 font-semibold">-{getCurrencySymbol(info.row.original.currency)}{info.getValue()?.toLocaleString()}</div>
    //       <div className="text-xs text-gray-500">
    //         {info.row.original.commissionType === 'Percentage'
    //           ? `${info.row.original.commissionValue}%`
    //           : 'Fixed'}
    //       </div>
    //     </div>
    //   ),
    // }),
    // columnHelper.accessor("vatAmount", {
    //   header: "VAT",
    //   cell: (info) => (
    //     <div>
    //       <div className="text-purple-600 font-semibold">+{getCurrencySymbol(info.row.original.currency)}{info.getValue()?.toLocaleString()}</div>
    //       <div className="text-xs text-gray-500">{info.row.original.vatRate}% on comm.</div>
    //     </div>
    //   ),
    // }),
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
      header: "Outstanding",
      cell: (info) => {
        const amount = info.getValue();
        return (
          <div className="text-[#1A1A1A] font-semibold text-xs">
            {getCurrencySymbol(info.row.original.currency)}{amount?.toLocaleString()}
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
                <div className="text-[#1A1A1A] font-semibold text-xs">
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => handleViewDetails(row.original)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Calculation Details"
          >
            <Info className="w-4 h-4" />
          </button> */}
          <button
            onClick={() => handleView(row.original)}
            className="p-2 text-[#1F59EE] hover:bg-green-50 rounded-lg transition-colors"
            title="View Full Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          {row.original.remainingAmount !== 0 && (
            <button
              onClick={() => openProcessModal(row.original)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors  bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}
            >
              Process Settlement
            </button>
          )}
        </div>
      ),
    }),
  ];
  const statusFilterOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
    { value: "PartiallyPaid", label: "Partially Paid" },
    { value: "InReview", label: "In Review" },
    { value: "Disputed", label: "Disputed" },
  ];

  const sortOptions = [
    { value: "periodStart_desc", label: "Latest First" },
    { value: "periodStart_asc", label: "Oldest First" },
  ];

  const hasActiveFilters = params.filterMonth || params.filterYear || params.status || params.frequency || params.search;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-8xl mx-auto">

        <DynamicTable
          data={data}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          title="Brand Settlements"
          subtitle="Monitor and manage brand settlements"
          searchPlaceholder="Brand or settlement ID..."
          filters={[
            {
              name: "filterMonth",
              placeholder: "Last Month (Default)",
              options: monthOptions,
            },
            {
              name: "filterYear",
              placeholder: "Frequency: All",
              options: yearOptions,
            },
            {
              name: "status",
              placeholder: "Status: All",
              options: statusFilterOptions,
            }
          ]}
        // emptyMessage="No settlement history found. Try adjusting your filters."
        />
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

      {processModalOpen && selectedSettlement && (
        <ProcessSettlementModal
          isOpen={processModalOpen}
          onClose={() => setProcessModalOpen(false)}
          settlement={selectedSettlement}
          onSuccess={() => {
            setProcessModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const ProcessSettlementModal = ({ isOpen, onClose, settlement, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPartialPayment, setIsPartialPayment] = useState(false);

  useEffect(() => {
    if (settlement) {
      setPaymentAmount(settlement.remainingAmount.toString());
      setIsPartialPayment(false);
      setProcessMessage(null);
      setPaymentNotes('');
    }
  }, [settlement]);

  if (!isOpen) return null;

  const handleProcessSettlement = async () => {
    if (!settlement?.id) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setProcessMessage({ type: 'error', text: 'Please enter a valid payment amount' });
      return;
    }

    if (amount > settlement.remainingAmount) {
      setProcessMessage({ type: 'error', text: 'Payment amount cannot exceed outstanding amount' });
      return;
    }

    try {
      setProcessing(true);
      setProcessMessage(null);

      const response = await fetch('/api/settlements/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementId: settlement.id,
          amount,
          notes: paymentNotes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProcessMessage({
          type: 'success',
          text: `Payment processed successfully! Payment Reference: ${result.data.reference}`
        });
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Process settlement error:', err);
      setProcessMessage({ type: 'error', text: err.message || 'Failed to process settlement' });
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentTypeChange = (isPartial) => {
    setIsPartialPayment(isPartial);
    if (!isPartial && settlement) {
      setPaymentAmount(settlement.remainingAmount.toString());
    } else {
      setPaymentAmount('');
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbol = currencyList.find(c => c.code === currency)?.symbol || '$';
    return `${symbol}${amount?.toLocaleString()}`;
  };

  const calculateRemaining = () => {
    if (!settlement || !paymentAmount) return 0;
    const amount = parseFloat(paymentAmount);
    return isNaN(amount) ? settlement.remainingAmount : settlement.remainingAmount - amount;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900">Process Settlement</h3>
          <button 
            onClick={onClose} 
            disabled={processing} 
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6">
          {processMessage ? (
            <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
              processMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {processMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                processMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {processMessage.text}
              </p>
            </div>
          ) : (
            <>
              {/* Brand Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {settlement.logo && (
                    <img
                      src={settlement.logo}
                      alt={settlement.brandName}
                      className="w-10 h-10 object-contain"
                    />
                  )}
                  <span className="font-semibold text-gray-900 text-lg">
                    {settlement.brandName}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Settlement Period:</span>
                    <span className="font-medium text-gray-900">
                      {settlement.settlementPeriod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Issued:</span>
                    <span className="font-medium text-gray-900">
                      {settlement.totalSold} vouchers
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Redeemed:</span>
                    <span className="font-medium text-gray-900">
                      {settlement.totalRedeemed} vouchers
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-medium">Total Outstanding:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(settlement.remainingAmount, settlement.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePaymentTypeChange(false)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      !isPartialPayment
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                      !isPartialPayment ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="font-medium text-gray-900">Full Payment</div>
                    <div className="text-xs text-gray-500 mt-1">Pay entire amount</div>
                  </button>
                  <button
                    onClick={() => handlePaymentTypeChange(true)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      isPartialPayment
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                      isPartialPayment ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="font-medium text-gray-900">Partial Payment</div>
                    <div className="text-xs text-gray-500 mt-1">Pay custom amount</div>
                  </button>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {currencyList.find(c => c.code === settlement.currency)?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={!isPartialPayment || processing}
                    min="0"
                    max={settlement.remainingAmount}
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isPartialPayment ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter amount"
                  />
                </div>
                {isPartialPayment && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {formatCurrency(settlement.remainingAmount, settlement.currency)}
                  </p>
                )}
              </div>

              {/* Remaining Amount */}
              {isPartialPayment && paymentAmount && parseFloat(paymentAmount) > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">
                      Remaining Balance:
                    </span>
                    <span className="font-bold text-blue-900">
                      {formatCurrency(calculateRemaining(), settlement.currency)}
                    </span>
                  </div>
                  {calculateRemaining() > 0 && (
                    <p className="text-xs text-blue-700 mt-1">
                      A new settlement will be created for the remaining amount
                    </p>
                  )}
                </div>
              )}

              {/* Payment Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  disabled={processing}
                  rows="3"
                  className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add payment notes or reference..."
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ This action will process the payment and cannot be undone.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!processMessage && (
          <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessSettlement}
              disabled={processing || !paymentAmount || parseFloat(paymentAmount) <= 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Payment'
              )}
            </button>
          </div>
        )}
      </div>
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
                  <h3 className="text-xl font-semibold text-white">Calculation Breakdown</h3>
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
              <h4 className="font-semibold text-[#1A1A1A] mb-3">Settlement Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Period:</span>
                  <div className="font-medium text-[#1A1A1A] ">{settlement.settlementPeriod}</div>
                </div>
                <div>
                  <span className="text-gray-600">Trigger:</span>
                  <div className="font-medium text-[#1A1A1A] ">
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
                <div className="text-2xl font-semibold text-blue-700">
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
                <div className="text-2xl font-semibold text-orange-600">
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
                <div className="text-2xl font-semibold text-purple-600">
                  +${settlement.vatAmount?.toLocaleString()}
                </div>
              </div>

              <div className="h-px bg-gray-300"></div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-500">
                <div>
                  <div className="text-sm text-green-600 font-medium">Net Payable</div>
                  <div className="text-xs text-green-500 mt-1">Base - Commission + VAT</div>
                </div>
                <div className="text-3xl font-semibold text-green-700">
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
                  <h3 className="text-xl font-semibold text-white">Payment History</h3>
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
                <div className="text-2xl font-semibold text-blue-700">
                  ${settlement.netPayable.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Total Paid</div>
                <div className="text-2xl font-semibold text-green-700">
                  ${settlement.totalPaid.toLocaleString()}
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-sm text-amber-600 mb-1">Remaining</div>
                <div className="text-2xl font-semibold text-amber-700">
                  ${settlement.remainingAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-[#1A1A1A] mb-3">
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
                          <div className="font-semibold text-[#1A1A1A] ">Payment #{idx + 1}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.paidAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ${payment.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                    </div>
                    {payment.reference && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500">Reference</div>
                        <div className="text-sm font-mono text-[#1A1A1A] ">{payment.reference}</div>
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