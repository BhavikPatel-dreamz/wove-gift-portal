"use client";

import { useState, useEffect } from "react";
import { getVouchers } from "@/lib/action/voucherAction";
import { Eye, Edit, Trash, Download, RefreshCw, ChevronDown, ChevronRight, Package } from "lucide-react";
import toast from "react-hot-toast";
import DynamicTable from "@/components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import Modal from "@/components/Modal";
import VoucherDetails from "@/components/vouchers/VoucherDetails";
import { useSession } from "@/contexts/SessionContext";
import AnalyticsTracking from "../../../components/orders/AnalyticsTracking";
import BrandAnalyticsTable from "../../../components/orders/BrandAnalyticsTable";

export default function VouchersManagement() {
  const session = useSession();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    from: 1,
    to: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await getVouchers({
        ...filters,
        page: pagination.currentPage,
        userId: session?.user?.id,
        userRole: session?.user?.role,
        pageSize: 10, // Fixed page size of 10 records
      });
      
      if (response.success) {
        setVouchers(response.data);
        setPagination(response.pagination);
        setError(null);
      } else {
        setError(response.message);
        toast.error(response.message);
        setVouchers([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An unexpected error occurred.");
      toast.error("Failed to fetch vouchers");
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchVouchers();
    }
  }, [filters, pagination.currentPage, session?.user]);

  const handleSearch = (search) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on search
  };

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Starting Shopify data sync...");

    try {
      const response = await fetch('/api/sync-shopify', { method: 'POST' });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Shopify data sync initiated. Data will be updated shortly.", { id: toastId });
        setTimeout(() => {
          fetchVouchers();
        }, 5000);
      } else {
        throw new Error(result.message || "Failed to sync Shopify data.");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(error.message || "An unexpected error occurred during sync.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const columnHelper = createColumnHelper();

  const StatusBadge = ({ status, statusBreakdown }) => {
    const statusConfig = {
      Redeemed: { color: "text-green-600 bg-green-50 border-green-200" },
      Active: { color: "text-blue-600 bg-blue-50 border-blue-200" },
      Expired: { color: "text-red-600 bg-red-50 border-red-200" },
      Inactive: { color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    };

    const config = statusConfig[status] || statusConfig.Active;

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
          {status}
        </span>
        {statusBreakdown && (
          <div className="text-xs text-gray-500">
            {statusBreakdown.active > 0 && <div className="mr-2">Active: {statusBreakdown.active}</div>}
            {statusBreakdown.redeemed > 0 && <div className="mr-2">Redeemed: {statusBreakdown.redeemed}</div>}
            {statusBreakdown.expired > 0 && <div>Expired: {statusBreakdown.expired}</div>}
          </div>
        )}
      </div>
    );
  };

  const ActionButtons = ({ row }) => (
    <div className="flex items-center gap-2">
      {row.isBulkOrder ? (
        <button
          onClick={() => toggleRowExpansion(row.id)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Expand/Collapse"
        >
          {expandedRows.has(row.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      ) : (
        <button
          onClick={() => handleViewVoucher(row)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // Conditionally show/hide columns based on role
  const isAdmin = session?.user?.role === 'ADMIN';

  const customColumns = [
    columnHelper.accessor("orderNumber", {
      header: "Order Number",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            {row.isBulkOrder && <Package className="w-4 h-4 text-blue-600" />}
            <span className="font-semibold text-gray-900">{info.getValue()}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("bulkOrderNumber", {
      header: "Bulk Order Number",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="font-semibold text-gray-900">
            {info.getValue() || '-'}
            {row.isBulkOrder && (
              <div className="mt-1">
                <span className="text-xs text-green-600">{row.voucherCount} vouchers</span>
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("code", {
      header: "Voucher Code",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <div className="font-semibold text-gray-900">{info.getValue()}</div>
            {row.isBulkOrder && (
              <div className="text-xs text-gray-500 mt-1">
                Click to expand and view details
              </div>
            )}
          </div>
        );
      },
    }),
    // Only show customer column for admin users
    ...(isAdmin ? [
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
      })
    ] : []),
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
      cell: (info) => {
        const row = info.row.original;
        return <StatusBadge status={info.getValue()} statusBreakdown={row.statusBreakdown} />;
      },
    }),
    columnHelper.accessor("lastRedemptionDate", {
      header: "Last Redemption Date",
      cell: (info) => (
        <div className="text-gray-700">
          {info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "-"}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionButtons row={row.original} />,
    }),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[90%] mx-auto">

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'orders'
              ? 'bg-white text-gray-900 shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white/80'
              }`}
          >
            Order Management
          </button>

          {session?.user?.role !== "CUSTOMER" && (
            <>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
              >
                Analytics & Tracking
              </button>
              <button
                onClick={() => setActiveTab('settlements')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'settlements'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
              >
                Brand Settlements
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="max-w-[90%] mx-auto">
          <DynamicTable
            data={vouchers}
            columns={customColumns}
            loading={loading || syncing}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onFilter={handleFilter}
            title="Vouchers & Gift Cards"
            subtitle={isAdmin ? "Track and manage all user-purchased vouchers and gift cards." : "View and manage your vouchers and gift cards."}
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
              ...(isAdmin ? [{
                label: syncing ? "Syncing..." : "Sync Shopify",
                icon: RefreshCw,
                onClick: handleSync,
                disabled: syncing,
              }] : []),
              {
                label: "Export",
                icon: Download,
                onClick: handleExport,
              },
            ]}
            emptyMessage={error || "No vouchers found. Try adjusting your filters."}
            renderExpandedRow={(row) => {
              if (!row.isBulkOrder || !expandedRows.has(row.id)) return null;
              
              return (
                <tr key={`${row.id}-expanded`}>
                  <td colSpan={customColumns.length} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700 mb-3">Individual Vouchers ({row.voucherCount})</h4>
                      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                        {row.children?.map((child, idx) => (
                          <div key={child.id || idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                                <div>
                                  <span className="block text-xs text-gray-500 mb-1">Order Number</span>
                                  <span className="font-medium text-gray-900">{child.orderNumber}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 mb-1">Voucher Code</span>
                                  <span className="font-medium text-gray-900">{child.code}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 mb-1">Total Amount</span>
                                  <span className="font-medium text-gray-900">${child.totalAmount?.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 mb-1">Remaining</span>
                                  <span className="font-medium text-gray-900">${child.remainingAmount?.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 mb-1">Status</span>
                                  <StatusBadge status={child.status} />
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 mb-1">Last Redemption</span>
                                  <span className="font-medium text-gray-900">
                                    {child.lastRedemptionDate 
                                      ? new Date(child.lastRedemptionDate).toLocaleDateString() 
                                      : "-"}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewVoucher(child)}
                                className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }}
          />

          <Modal isOpen={isModalOpen} onClose={closeModal} title="Voucher Details">
            {selectedVoucher && <VoucherDetails voucher={selectedVoucher} />}
          </Modal>
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTracking />
      )}

      {activeTab === 'settlements' && (
        <BrandAnalyticsTable />
      )}

    </div>
  );
}