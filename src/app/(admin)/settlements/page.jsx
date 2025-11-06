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
} from "lucide-react";
import toast from "react-hot-toast";
import { getSettlementDetailsByBrandId, getSettlements } from "../../../lib/action/brandPartner";
import SettlementDetailsModal from "../../../components/settlements/SettlementDetailsModal";

const SettlementsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = useMemo(
    () => ({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
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
    newParams.set(name, value);
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
      header: "Brand Name",
      cell: (info) => (
        <div className="font-semibold text-gray-900">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("totalSold", {
      header: "Total Sold",
      cell: (info) => (
        <div className="text-gray-900 font-medium">
          {info.getValue().toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor("redeemedAmount", {
      header: "Redeemed",
      cell: (info) => {
        const redeemedAmount = info.getValue() || 0;
        const totalSoldAmount = info.row.original.totalSoldAmount || 0;
        
        const percentage = totalSoldAmount > 0 ? (redeemedAmount / totalSoldAmount) * 100 : 0;

        return (
          <div>
            <div className="text-gray-900 font-medium">
              ₹{redeemedAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {percentage.toFixed(1)}% redeemed
            </div>
          </div>
        );
      },
    }), columnHelper.accessor("outstandingAmount", {
      header: "Outstanding",
      cell: (info) => (
        <div className="text-gray-900">
          {info.getValue().toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor("settlementTrigger", {
      header: "Settlement Terms",
      cell: (info) => <div className="text-gray-700">{info.getValue()}</div>,
    }),
    columnHelper.accessor("lastPaymentDate", {
      header: "Last Payment",
      cell: (info) => (
        <div className="text-gray-700">
          {info.getValue()
            ? new Date(info.getValue()).toLocaleDateString()
            : "N/A"}
        </div>
      ),
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
          <DynamicTable
            data={data}
            columns={customColumns}
            loading={loading || syncing}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onFilter={handleFilter}
            title="Brand Settlements"
            subtitle="Monitor and manage brand settlement payments"
            searchPlaceholder="Search by brand or settlement ID..."
            filters={[
              {
                name: "status",
                placeholder: "All Statuses",
                options: [
                  { value: "Pending", label: "Pending" },
                  { value: "Paid", label: "Paid" },
                  { value: "InReview", label: "In Review" },
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

      <SettlementDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedSettlement}
        loading={modalLoading}
      />
    </>
  );
};

export default SettlementsPage;