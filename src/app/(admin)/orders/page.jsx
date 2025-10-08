"use client";

import { useState, useEffect } from "react";
import { getOrders, getOrderById } from "@/lib/action/orderAction";
import { Eye, Edit, Download } from "lucide-react";
import toast from "react-hot-toast";
import DynamicTable from "@/components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import Modal from "@/components/Modal";
import OrderDetails from "@/components/orders/OrderDetails";

export default function GiftOrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    brand: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await getOrders({ ...filters, page: pagination.currentPage || 1 });
        if (response.success) {
          setOrders(response.data);
          setPagination(response.pagination);
          setError(null);
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
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

  const handleViewOrder = async (orderId) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setSelectedOrder(null);
    try {
      const response = await getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Failed to fetch order details");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setModalLoading(false);
  };

  const handleExport = () => {
    toast.info("Exporting orders...");
    // Add your export logic here
  };

  const columnHelper = createColumnHelper();

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Redeemed: {
        color: "text-green-600 bg-green-50 border-green-200",
      },
      Issued: {
        color: "text-blue-600 bg-blue-50 border-blue-200",
      },
      Expired: {
        color: "text-red-600 bg-red-50 border-red-200",
      },
      NotRedeemed: {
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      },
    };

    const config = statusConfig[status] || statusConfig.Issued;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
        {status}
      </span>
    );
  };

  const ActionButtons = ({ row }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleViewOrder(row.original.id)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={() => toast.info(`Editing order: ${row.original.orderNumber}`)}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Edit Order"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );

  const customColumns = [
    columnHelper.accessor("orderNumber", {
      header: "Order ID",
      cell: (info) => <div className="font-semibold text-gray-900">{info.getValue()}</div>,
    }),
    columnHelper.accessor("receiverDetail", {
      header: "Customer",
      cell: (info) => {
        const receiver = info.getValue();
        return (
          <div>
            <div className="font-medium text-gray-900">{receiver?.name || "N/A"}</div>
            <div className="text-xs text-gray-500">{receiver?.email || "N/A"}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => <div className="text-gray-900 font-medium">${info.getValue()}</div>,
    }),
    columnHelper.accessor("brand", {
      header: "Brand",
      cell: (info) => <div className="text-gray-900">{info.getValue()?.brandName || "N/A"}</div>,
    }),
    columnHelper.accessor("redemptionStatus", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("redeemedAt", {
      header: "Date",
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
          data={orders}
          columns={customColumns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          title="Gift Orders Management"
          subtitle="Complete gift card tracking, redemption monitoring, and settlement management"
          searchPlaceholder="Search orders by ID, customer, or email..."
          filters={[
            {
              name: "status",
              placeholder: "All Statuses",
              options: [
                { value: "Issued", label: "Issued" },
                { value: "Redeemed", label: "Redeemed" },
                { value: "Expired", label: "Expired" },
                { value: "NotRedeemed", label: "Not Redeemed" },
              ],
            },
            {
              name: "brand",
              placeholder: "All Brands",
              options: [
                // Add your brand options dynamically
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
          emptyMessage={error || "No orders found. Try adjusting your filters."}
        />

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          {modalLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <OrderDetails order={selectedOrder} />
          )}
        </Modal>
      </div>
    </div>
  );
}