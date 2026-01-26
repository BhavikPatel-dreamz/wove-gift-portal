"use client";

import { useState, useEffect, useTransition } from "react";
import { getBulkOrderDetails, getBrandsForFilter } from "@/lib/action/voucherAction";
import { Eye, Download, RefreshCw, Package, X, Search, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import DynamicTable from "@/components/forms/DynamicTable";
import { createColumnHelper } from "@tanstack/react-table";
import Modal from "@/components/Modal";
import VoucherDetails from "@/components/vouchers/VoucherDetails";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { currencyList } from "../brandsPartner/currency";

export default function VouchersClient({ initialVouchers, initialPagination, user, initialBrands = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const vouchers = initialVouchers;
  const pagination = initialPagination;
  const [brands, setBrands] = useState(initialBrands);

  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  console.log(vouchers);

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBulkOrder, setSelectedBulkOrder] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [bulkData, setBulkData] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkPagination, setBulkPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    from: 0,
    to: 0,
    total: 0,
  });
  const [bulkFilters, setBulkFilters] = useState({
    search: "",
    status: "",
  });

  // Load brands on component mount if not provided
  useEffect(() => {
    if (initialBrands.length === 0) {
      getBrandsForFilter().then(result => {
        if (result.success) {
          setBrands(result.data);
        }
      });
    }
  }, []);

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "";

  const handleUpdateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (search) => {
    handleUpdateParams({ search, page: 1 });
  };

  const handleFilter = (name, value) => {
    handleUpdateParams({ [name]: value, page: 1 });
  };

  const handlePageChange = (page) => {
    handleUpdateParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchBulkOrderDetails = async (bulkOrderNumber, orderNumber) => {
    setBulkLoading(true);
    try {
      const response = await getBulkOrderDetails({
        bulkOrderNumber,
        orderNumber,
        page: bulkPagination.currentPage,
        pageSize: 10,
        search: bulkFilters.search,
        status: bulkFilters.status,
      });

      if (response.success) {
        setBulkData(response.data);
        setBulkPagination(response.pagination);
      } else {
        toast.error(response.message);
        setBulkData(null);
      }
    } catch (err) {
      console.error("Fetch bulk order error:", err);
      toast.error("Failed to fetch bulk order details");
      setBulkData(null);
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBulkOrder && isBulkModalOpen) {
      fetchBulkOrderDetails(selectedBulkOrder.bulkOrderNumber, selectedBulkOrder.orderNumber);
    }
  }, [selectedBulkOrder, bulkPagination.currentPage, bulkFilters]);

  const handleViewVoucher = (voucher, fromBulkOrder = false) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleViewBulkOrder = (bulkOrder) => {
    setSelectedBulkOrder(bulkOrder);
    setBulkPagination({ currentPage: 1, totalPages: 1, totalCount: 0, from: 0, to: 0, total: 0 });
    setBulkFilters({ search: "", status: "" });
    setBulkData(null);
    setIsBulkModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setSelectedBulkOrder(null);
    setBulkData(null);
    setBulkPagination({ currentPage: 1, totalPages: 1, totalCount: 0, from: 0, to: 0, total: 0 });
    setBulkFilters({ search: "", status: "" });
  };

  const handleBulkSearch = (search) => {
    setBulkFilters((prev) => ({ ...prev, search }));
    setBulkPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleBulkFilter = (status) => {
    setBulkFilters((prev) => ({ ...prev, status }));
    setBulkPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleBulkPageChange = (page) => {
    setBulkPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleExport = () => {
    toast.info("Exporting vouchers...");
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
          router.refresh();
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

  const columnHelper = createColumnHelper();

  const StatusBadge = ({ status, statusBreakdown }) => {
    const statusConfig = {
      Redeemed: { color: "text-green-600 bg-green-50 border-green-200" },
      Active: { color: "text-blue-600 bg-blue-50 border-blue-200" },
      Expired: { color: "text-red-600 bg-red-50 border-red-200" },
      Inactive: { color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
      Cancelled: { color: "text-gray-600 bg-gray-100 border-gray-300" }, // Added
    };

    const config = statusConfig[status] || statusConfig.Active;

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center text-center px-2 justify-center py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
          {status === "Active" ? "Issued" : status}
        </span>
        {statusBreakdown && (
          <div className="text-xs text-center text-gray-500">
            {statusBreakdown.active > 0 && <div>Active: {statusBreakdown.active}</div>}
            {statusBreakdown.redeemed > 0 && <div>Redeemed: {statusBreakdown.redeemed}</div>}
            {statusBreakdown.expired > 0 && <div>Expired: {statusBreakdown.expired}</div>}
            {statusBreakdown.cancelled > 0 && <div>Cancelled: {statusBreakdown.cancelled}</div>}
          </div>
        )}
      </div>
    );
  };

  const ActionButtons = ({ row }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => row.isBulkOrder ? handleViewBulkOrder(row) : handleViewVoucher(row)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );

  const isAdmin = user?.role === 'ADMIN';

  const customColumns = [
    columnHelper.accessor("Brand", {
      header: "Brands",
      cell: (info) => (
        <div>
          <div className="font-semibold text-gray-900">{info.row.original.brandName}</div>
        </div>
      ),
    }),
    columnHelper.accessor("orderNumber", {
      header: "Order Number",
      cell: (info) => (
        <div className="flex items-center w-40">
          <span className="font-semibold text-gray-900">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("bulkOrderNumber", {
      header: "Bulk Order Number",
      cell: (info) => (
        <div className="font-semibold text-gray-900 w-40">
          {info.getValue() || '-'}
        </div>
      ),
    }),
    columnHelper.accessor("code", {
      header: "Voucher Code",
      cell: (info) => (
        <div>
          <div className="font-semibold text-gray-900">{info.getValue()}</div>
        </div>
      ),
    }),
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
      cell: (info) => <div className="text-gray-900 font-medium">{getCurrencySymbol(info.row.original.currency)}{info.getValue()?.toFixed(2)}</div>,
    }),
    columnHelper.accessor("remainingAmount", {
      header: "Remaining Amount",
      cell: (info) => <div className="text-gray-900 font-medium">{getCurrencySymbol(info.row.original.currency)}{info.getValue()?.toFixed(2)}</div>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const row = info.row.original;
        return <StatusBadge status={info.getValue()} statusBreakdown={row.statusBreakdown} />;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Issued Date",
      cell: (info) => {
        if (!info.getValue()) return <div className="text-gray-700">-</div>;

        const date = new Date(info.getValue());
        const formatted = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        return <div className="text-gray-700">{formatted}</div>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionButtons row={row.original} />,
    }),
  ];

  // Get current filter values from URL
  const currentBrandId = searchParams.get('brandId') || '';
  const currentDateFrom = searchParams.get('dateFrom') || '';
  const currentDateTo = searchParams.get('dateTo') || '';

  // Prepare brand options for dropdown
  const brandOptions = brands.map(brand => ({
    value: brand.id,
    label: brand.brandName
  }));

  return (
    <div className="max-w-[100%] mx-auto">
      <DynamicTable
        data={vouchers}
        columns={customColumns}
        loading={isPending}
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
            value: searchParams.get('status') || '',
            options: [
              { value: "Active", label: "Issued" },
              { value: "Redeemed", label: "Redeemed" },
              { value: "Expired", label: "Expired" },
              { value: "Inactive", label: "Inactive" },
              { value: "Cancelled", label: "Cancelled" }, // Added
            ],
          },
          {
            name: "brandId",
            placeholder: "All Brands",
            value: currentBrandId,
            options: brandOptions,
          },
          {
            name: "dateFrom",
            type: "date",
            placeholder: "From Date",
            value: currentDateFrom,
          },
          {
            name: "dateTo",
            type: "date",
            placeholder: "To Date",
            value: currentDateTo,
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
      />

      {/* Voucher Details Modal */}
      {isModalOpen && selectedVoucher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Voucher Details</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <VoucherDetails voucher={selectedVoucher} />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Order Modal */}
      {isBulkModalOpen && selectedBulkOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Bulk Order Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBulkOrder.bulkOrderNumber} • {selectedBulkOrder.voucherCount} Vouchers
                </p>
              </div>
              <button onClick={closeBulkModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-blue-900">{getCurrencySymbol(bulkData?.currency)}{bulkData?.totalAmount?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-xs text-green-600 font-semibold mb-1">Remaining</div>
                  <div className="text-2xl font-bold text-green-900">{getCurrencySymbol(bulkData?.currency)}{bulkData?.remainingAmount?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-600 font-semibold mb-1">Order Count</div>
                  <div className="text-2xl font-bold text-purple-900">{bulkData?.orderCount || 0}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-xs text-orange-600 font-semibold mb-1">Voucher Count</div>
                  <div className="text-2xl font-bold text-orange-900">{bulkData?.voucherCount || 0}</div>
                </div>
              </div>

              {bulkData?.statusBreakdown && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h3>
                  <div className="flex gap-6 flex-wrap">
                    {bulkData.statusBreakdown.active > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Active: <span className="font-semibold">{bulkData.statusBreakdown.active}</span></span>
                      </div>
                    )}
                    {bulkData.statusBreakdown.redeemed > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">Redeemed: <span className="font-semibold">{bulkData.statusBreakdown.redeemed}</span></span>
                      </div>
                    )}
                    {bulkData.statusBreakdown.expired > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-600">Expired: <span className="font-semibold">{bulkData.statusBreakdown.expired}</span></span>
                      </div>
                    )}
                    {bulkData.statusBreakdown.cancelled > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-sm text-gray-600">Cancelled: <span className="font-semibold">{bulkData.statusBreakdown.cancelled}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-3 mb-5 items-center">
                <div className="relative w-full md:w-1/3 text-black">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by voucher code..."
                    className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm"
                    value={bulkFilters.search}
                    onChange={(e) => handleBulkSearch(e.target.value)}
                  />
                </div>

                <select
                  className="border px-3 py-2 rounded-lg text-sm text-black"
                  value={bulkFilters.status}
                  onChange={(e) => handleBulkFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Redeemed">Redeemed</option>
                  <option value="Expired">Expired</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {bulkPagination.totalCount > 0 && (
                  <div className="text-sm text-gray-600 ml-auto">
                    Showing {bulkPagination.from} - {bulkPagination.to} of {bulkPagination.totalCount} vouchers
                  </div>
                )}
              </div>

              {bulkLoading && (
                <div className="text-center py-10">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 mt-2">Loading vouchers...</p>
                </div>
              )}

              {!bulkLoading && (
                <div className="space-y-3">
                  {bulkData?.children && bulkData.children.length > 0 ? (
                    bulkData.children.map((child, idx) => (
                      <div key={child.id || idx} className="bg-white p-4 rounded-lg border hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm flex-1">
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Order Number</span>
                              <span className="font-medium text-gray-900">{child.orderNumber}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Voucher Code</span>
                              <span className="font-medium text-gray-900">{child.code}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Total</span>
                              <span className="font-medium text-gray-900">{child.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Remaining</span>
                              <span className="font-medium text-gray-900">{child.remainingAmount?.toFixed(2)}</span>
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
                            onClick={() => handleViewVoucher(child, true)}
                            className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-10">No vouchers found matching your filters.</div>
                  )}
                </div>
              )}

              {!bulkLoading && bulkPagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Page {bulkPagination.currentPage} of {bulkPagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                      disabled={bulkPagination.currentPage === 1}
                      onClick={() => handleBulkPageChange(1)}
                    >
                      First
                    </button>
                    <button
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                      disabled={bulkPagination.currentPage === 1}
                      onClick={() => handleBulkPageChange(bulkPagination.currentPage - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                      disabled={bulkPagination.currentPage === bulkPagination.totalPages}
                      onClick={() => handleBulkPageChange(bulkPagination.currentPage + 1)}
                    >
                      Next
                    </button>
                    <button
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                      disabled={bulkPagination.currentPage === bulkPagination.totalPages}
                      onClick={() => handleBulkPageChange(bulkPagination.totalPages)}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}