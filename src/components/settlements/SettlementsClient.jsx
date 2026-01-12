"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  X,
  Info,
  CreditCard,
  FileText,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import DynamicTable from "@/components/forms/DynamicTable";
import { currencyList } from "@/components/brandsPartner/currency";
import ProcessSettlementModal from "./ProcessSettlementModal";

export default function SettlementsClient({
  initialData,
  initialPagination,
  initialSummary,
  initialFilterInfo,
}) {
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);

  const router = useRouter();

  console.log("initialData",initialData)

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "$";

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
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

  const handlePageChange = (page) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (search) => {
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleFilter = (name, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(name, value);
      if (name === "filterMonth" && value) {
        params.delete("filterYear");
      } else if (name === "filterYear" && value) {
        params.delete("filterMonth");
      }
    } else {
      params.delete(name);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleView = (row) => {
    router.push(`/settlements/${row.id}/overview`);
  };

  const openProcessModal = (settlement) => {
    setSelectedSettlement(settlement);
    setProcessModalOpen(true);
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
      PartiallyPaid: {
        icon: AlertTriangle,
        color: "text-blue-600 bg-blue-50 border-blue-200",
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

  const columns = [
    columnHelper.accessor("brandName", {
      header: "Brand",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold text-[#1A1A1A]">{info.getValue()}</div>
            {/* {info.row.original.brand.brandTerms.settlementTrigger && (
              <div className="text-xs text-[#64748B] capitalize">
                {info.row.original.brand.brandTerms.settlementTrigger === "onRedemption" ? "Redeemed" : "Sold"}
              </div>
            )} */}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("settlementPeriod", {
      header: "Period",
      cell: (info) => (
        <div className="text-xs text-[#1A1A1A] font-semibold">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("baseAmount", {
      header: "Base Amount",
      cell: (info) => (
        <div>
          <div className="text-[#1A1A1A] font-semibold">
            {getCurrencySymbol(info.row.original.currency)}
            {info.getValue()?.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748B]">
            {info.row.original.settlementTrigger === "onRedemption"
              ? "Redeemed"
              : "Sold"}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("netPayable", {
      header: "Net Payable",
      cell: (info) => (
        <div>
          <div className="text-[#1A1A1A] font-semibold text-xs">
            {getCurrencySymbol(info.row.original.currency)}
            {info.getValue()?.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748B]">
            -
            {info.row.original.commissionType === "Percentage"
              ? `${info.row.original.commissionValue}%`
              : "Fixed"}{" "}
            Commission
          </div>
          <div className="text-xs text-gray-500">
            +{info.row.original.vatRate}% VAT
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("remainingAmount", {
      header: "Outstanding",
      cell: (info) => {
        const amount = info.getValue();
        return (
          <div className="text-[#1A1A1A] font-semibold text-xs">
            {getCurrencySymbol(info.row.original.currency)}
            {amount?.toLocaleString()}
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
                  {new Date(info.getValue()).toLocaleDateString("en-US")}
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
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-8xl mx-auto">
        <DynamicTable
          data={initialData}
          columns={columns}
          loading={false}
          pagination={initialPagination}
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
              placeholder: "Select Year",
              options: yearOptions,
            },
            {
              name: "status",
              placeholder: "Status: All",
              options: statusFilterOptions,
            },
          ]}
        />
      </div>


      {processModalOpen && selectedSettlement && (
        <ProcessSettlementModal
          isOpen={processModalOpen}
          onClose={() => setProcessModalOpen(false)}
          settlement={selectedSettlement}
          onSuccess={() => {
            setProcessModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}