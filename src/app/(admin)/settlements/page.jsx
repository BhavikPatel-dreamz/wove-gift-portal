"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DynamicTable from "../../../components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Clock, CheckCircle, AlertTriangle, Eye, Download } from "lucide-react";
import toast from "react-hot-toast";
import { getSettlements } from "../../../lib/action/brandPartner";

const Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = useMemo(() => ({
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 10,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
  }), [searchParams]);

  useEffect(() => {
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

  const handleFilter = (status) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("status", status);
    newParams.set("page", 1);
    router.push(`?${newParams.toString()}`);
  };

  const columnHelper = createColumnHelper();

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: {
        icon: Clock,
        color: "text-amber-600 bg-amber-50 border-amber-200",
        iconColor: "text-amber-600",
      },
      Paid: {
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200",
        iconColor: "text-green-600",
      },
      Review: {
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50 border-red-200",
        iconColor: "text-red-600",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${config.color}`}>
        <IconComponent size={14} className={config.iconColor} />
        {status}
      </div>
    );
  };

  const ActionButtons = ({ row, onView, onDownload, onMarkPaid }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onView(row.original)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
        <Eye size={14} />
        View
      </button>
      <button
        onClick={() => onDownload(row.original)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
        <Download size={14} />
        CSV
      </button>
      {row.original.status === "Pending" && (
        <button
          onClick={() => onMarkPaid(row.original)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">
          Mark Paid
        </button>
      )}
    </div>
  );

  const customColumns = [
    columnHelper.accessor("brandName", {
      header: "Brand Name",
      cell: (info) => <div className="font-medium text-gray-900">{info.getValue()}</div>,
    }),
    columnHelper.accessor("totalSold", {
      header: "Total Sold",
      cell: (info) => <div className="text-gray-900">R {info.getValue().toLocaleString()}</div>,
    }),
    columnHelper.accessor("redeemedAmount", {
      header: "Redeemed",
      cell: (info) => {
        const redeemedAmount = info.getValue();
        const totalSold = info.row.original.totalSold;
        const percentage = totalSold > 0 ? (redeemedAmount / totalSold) * 100 : 0;
        return (
          <div>
            <div className="text-gray-900">R {redeemedAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{percentage.toFixed(2)}% redeemed</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("outstandingAmount", {
      header: "Outstanding",
      cell: (info) => <div className="text-gray-900">R {info.getValue().toLocaleString()}</div>,
    }),
    columnHelper.accessor("settlementTrigger", {
      header: "Settlement Terms",
      cell: (info) => <div className="text-gray-700">{info.getValue()}</div>,
    }),
    columnHelper.accessor("netPayable", {
      header: "Amount Owed",
      cell: (info) => <div className="font-medium text-green-600">R {info.getValue().toLocaleString()}</div>,
    }),
    columnHelper.accessor("lastPaymentDate", {
      header: "Last Payment",
      cell: (info) => <div className="text-gray-700">{info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "N/A"}</div>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionButtons
          row={row}
          onView={handleView}
          onDownload={handleDownload}
          onMarkPaid={handleMarkPaid}
        />
      ),
    }),
  ];

  const handleView = (row) => {
    toast.info(`Viewing details for: ${row.brandName}`);
  };

  const handleDownload = (row) => {
    toast.info(`Downloading CSV for: ${row.brandName}`);
  };

  const handleMarkPaid = (row) => {
    toast.info(`Marking as paid: ${row.brandName}`);
  };

  return (
    <div className="p-6">
      <DynamicTable
        data={data}
        columns={customColumns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchPlaceholder="Search by brand or settlement ID..."
        filterOptions={[
          { value: "", label: "All Statuses" },
          { value: "Pending", label: "Pending" },
          { value: "Paid", label: "Paid" },
          { value: "Review", label: "Review" },
        ]}
      />
    </div>
  );
};

export default Page;
