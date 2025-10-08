"use client";

import { useState, useEffect } from "react";
import { getVouchers } from "@/lib/action/voucherAction";
import { Eye, Edit, Trash, Download } from "lucide-react";
import toast from "react-hot-toast";
import DynamicTable from "@/components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import Modal from "@/components/Modal";
import VoucherDetails from "@/components/vouchers/VoucherDetails";

export default function VouchersManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      try {
        const response = await getVouchers({ ...filters, page: pagination.currentPage || 1 });
        if (response.success) {
          setVouchers(response.data);
          setPagination(response.pagination);
          setError(null);
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
        toast.error("Failed to fetch vouchers");
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, [filters, pagination.currentPage]);

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleViewVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
  };

  const handleExport = () => {
    toast.info("Exporting vouchers...");
    // Add your export logic here
  };

  const columnHelper = createColumnHelper();

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Redeemed: { color: "text-green-600 bg-green-50 border-green-200" },
      Active: { color: "text-blue-600 bg-blue-50 border-blue-200" },
      Expired: { color: "text-red-600 bg-red-50 border-red-200" },
      Inactive: { color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    };

    const config = statusConfig[status] || statusConfig.Active;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
        {status}
      </span>
    );
  };

  const ActionButtons = ({ row }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleViewVoucher(row.original)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
     
    </div>
  );

  const customColumns = [
    columnHelper.accessor("code", {
      header: "Voucher Code",
      cell: (info) => <div className="font-semibold text-gray-900">{info.getValue()}</div>,
    }),
    columnHelper.accessor("user", {
      header: "Customer",
      cell: (info) => {
        const user = info.getValue();
        return (
          <div>
            <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("totalAmount", {
      header: "Total Amount",
      cell: (info) => <div className="text-gray-900 font-medium">${info.getValue()?.toFixed(2)}</div>,
    }),
    columnHelper.accessor("remainingAmount", {
      header: "Remaining Amount",
      cell: (info) => <div className="text-gray-900 font-medium">${info.getValue()?.toFixed(2)}</div>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("expiryDate", {
      header: "Expiry Date",
      cell: (info) => (
        <div className="text-gray-700">
          {info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "N/A"}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionButtons row={row} />,
    }),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <DynamicTable
          data={vouchers}
          columns={customColumns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          title="Vouchers & Gift Cards"
          subtitle="Track and manage all user-purchased vouchers and gift cards."
          searchPlaceholder="Search by code, user email, or status..."
          filters={[
            {
              name: "status",
              placeholder: "All Statuses",
              options: [
                { value: "Active", label: "Active" },
                { value: "Redeemed", label: "Redeemed" },
                { value: "Expired", label: "Expired" },
                { value: "Inactive", label: "Inactive" },
              ],
            },
          ]}
          actions={[
            {
              label: "Export",
              icon: Download,
              onClick: handleExport,
            },
          ]}
          emptyMessage={error || "No vouchers found. Try adjusting your filters."}
        />

        <Modal isOpen={isModalOpen} onClose={closeModal} title="Voucher Details">
          {selectedVoucher && <VoucherDetails voucher={selectedVoucher} />}
        </Modal>
      </div>
    </div>
  );
}
