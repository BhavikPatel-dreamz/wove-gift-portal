import React, { useState } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Gift,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  Percent,
  User,
  Mail,
  Phone,
  Building,
  Loader,
} from "lucide-react";

const SettlementDetailsModal = ({ isOpen, onClose, data, loading }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading settlement details...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { settlement, brand, brandTerms, brandBanking, brandContacts, voucherBreakdown, summary } = data;

  const stats = [
    {
      label: "Total Sold",
      value: `R ${settlement.totalSold?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Redeemed",
      value: `R ${settlement.totalRedeemed?.toLocaleString() || 0}`,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Outstanding",
      value: `R ${settlement.outstanding?.toLocaleString() || 0}`,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Amount Owed",
      value: `R ${settlement.netPayable?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity" onClick={onClose} />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              {brand.logo && (
                <img src={brand.logo} alt={brand.brandName} className="w-12 h-12 rounded-lg" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{brand.brandName}</h2>
                <p className="text-blue-100 text-sm">Complete Settlement Details</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 120px)" }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`${stat.color} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{stat.label}</span>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="border-b bg-white sticky top-0">
              <div className="flex gap-0 overflow-x-auto">
                {["overview", "vouchers", "contacts", "banking", "terms"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Settlement Period */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Settlement Period
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Period</p>
                          <p className="font-medium text-gray-900">{settlement.settlementPeriod}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(settlement.periodStart).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">End Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(settlement.periodEnd).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Payment Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                                settlement.status === "Paid"
                                  ? "bg-green-50 text-green-700"
                                  : settlement.status === "Pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {settlement.status === "Paid" && <CheckCircle className="w-3 h-3" />}
                              {settlement.status === "Pending" && <Clock className="w-3 h-3" />}
                              {settlement.status === "InReview" && <AlertCircle className="w-3 h-3" />}
                              {settlement.status}
                            </span>
                          </div>
                        </div>
                        {settlement.paidAt && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500">Paid Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(settlement.paidAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {settlement.paymentReference && (
                          <div>
                            <p className="text-xs text-gray-500">Payment Reference</p>
                            <p className="text-sm font-medium text-gray-900 break-all">
                              {settlement.paymentReference}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Financial Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600">Commission</p>
                        <p className="text-lg font-semibold text-gray-900">
                          R {settlement.commissionAmount?.toLocaleString() || 0}
                        </p>
                      </div>
                      {settlement.breakageAmount > 0 && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600">Breakage</p>
                          <p className="text-lg font-semibold text-gray-900">
                            R {settlement.breakageAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                      )}
                      {settlement.vatAmount > 0 && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-600">VAT</p>
                          <p className="text-lg font-semibold text-gray-900">
                            R {settlement.vatAmount?.toLocaleString() || 0}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <p className="text-xs text-blue-600 font-medium mb-2">Voucher Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Total Issued</span>
                          <span className="font-semibold text-gray-900">{summary.totalVouchersIssued}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Redeemed</span>
                          <span className="font-semibold text-green-600">{summary.totalVouchersRedeemed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Unredeemed</span>
                          <span className="font-semibold text-amber-600">{summary.totalVouchersUnredeemed}</span>
                        </div>
                        <div className="pt-2 border-t border-blue-200 flex justify-between">
                          <span className="text-sm font-medium text-blue-700">Redemption Rate</span>
                          <span className="font-bold text-blue-700">{summary.voucherRedemptionRate}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-purple-50">
                      <p className="text-xs text-purple-600 font-medium mb-2">Delivery Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Total</span>
                          <span className="font-semibold text-gray-900">{summary.deliverySummary.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Delivered</span>
                          <span className="font-semibold text-green-600">{summary.deliverySummary.delivered}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Pending</span>
                          <span className="font-semibold text-amber-600">{summary.deliverySummary.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Failed</span>
                          <span className="font-semibold text-red-600">{summary.deliverySummary.failed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vouchers Tab */}
              {activeTab === "vouchers" && (
                <div className="space-y-4">
                  {voucherBreakdown && voucherBreakdown.length > 0 ? (
                    voucherBreakdown.map((voucher, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                          <div className="bg-blue-50 rounded p-3">
                            <p className="text-xs text-blue-600">Total Issued</p>
                            <p className="text-2xl font-bold text-blue-700">{voucher.totalIssued}</p>
                          </div>
                          <div className="bg-green-50 rounded p-3">
                            <p className="text-xs text-green-600">Redeemed</p>
                            <p className="text-2xl font-bold text-green-700">{voucher.totalRedeemed}</p>
                          </div>
                          <div className="bg-amber-50 rounded p-3">
                            <p className="text-xs text-amber-600">Unredeemed</p>
                            <p className="text-2xl font-bold text-amber-700">{voucher.totalUnredeemed}</p>
                          </div>
                          <div className="bg-purple-50 rounded p-3">
                            <p className="text-xs text-purple-600">Redemption Rate</p>
                            <p className="text-2xl font-bold text-purple-700">{voucher.redemptionRate}%</p>
                          </div>
                        </div>

                        {voucher.denominationBreakdown && voucher.denominationBreakdown.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Denomination Breakdown</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Value</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Issued</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Redeemed</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Unredeemed</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Rate</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Expires</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {voucher.denominationBreakdown.map((denom, didx) => (
                                    <tr key={didx} className="border-b hover:bg-gray-50">
                                      <td className="px-4 py-2 font-medium text-black">
                                        {denom.currency} {denom.value}
                                      </td>
                                      <td className="px-4 py-2 text-blue-600 font-semibold">{denom.issued}</td>
                                      <td className="px-4 py-2 text-green-600 font-semibold">{denom.redeemed}</td>
                                      <td className="px-4 py-2 text-amber-600 font-semibold">{denom.unredeemed}</td>
                                      <td className="px-4 py-2">
                                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                                          {denom.percentage}%
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-gray-600">
                                        {denom.expiresAt ? new Date(denom.expiresAt).toLocaleDateString() : "No expiry"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No voucher data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Contacts Tab */}
              {activeTab === "contacts" && (
                <div>
                  {brandContacts && brandContacts.length > 0 ? (
                    <div className="space-y-4">
                      {brandContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`border rounded-lg p-4 ${contact.isPrimary ? "border-blue-300 bg-blue-50" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                                <p className="text-sm text-gray-600">{contact.role}</p>
                              </div>
                            </div>
                            {contact.isPrimary && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                                {contact.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No contact information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Banking Tab */}
              {activeTab === "banking" && (
                <div>
                  {brandBanking ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Bank Account Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Account Holder</p>
                            <p className="font-medium text-gray-900">{brandBanking.accountHolder}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Account Number</p>
                            <p className="font-medium text-gray-900">{brandBanking.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                            <p className="font-medium text-gray-900">{brandBanking.bankName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Branch Code</p>
                            <p className="font-medium text-gray-900">{brandBanking.branchCode}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Country</p>
                            <p className="font-medium text-gray-900">{brandBanking.country}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Payout Method</p>
                            <p className="font-medium text-gray-900">{brandBanking.payoutMethod}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Settlement Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Settlement Frequency</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {brandBanking.settlementFrequency}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Account Verification</p>
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                                  brandBanking.accountVerification
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {brandBanking.accountVerification ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3" />
                                    Not Verified
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No banking information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Terms Tab */}
              {activeTab === "terms" && (
                <div>
                  {brandTerms ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Commission & Pricing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Commission Type</p>
                            <p className="font-medium text-gray-900 capitalize">{brandTerms.commissionType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Commission Value</p>
                            <p className="font-medium text-gray-900">
                              {brandTerms.commissionType === "Percentage"
                                ? `${brandTerms.commissionValue}%`
                                : `R ${brandTerms.commissionValue}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Minimum Order Value</p>
                            <p className="font-medium text-gray-900">
                              R {brandTerms.minOrderValue?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Maximum Discount</p>
                            <p className="font-medium text-gray-900">
                              R {brandTerms.maxDiscount?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Contract Terms</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Settlement Trigger</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {brandTerms.settlementTrigger}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">VAT Rate</p>
                            <p className="font-medium text-gray-900">{brandTerms.vatRate || 0}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Contract Start</p>
                            <p className="font-medium text-gray-900">
                              {brandTerms.contractStart
                                ? new Date(brandTerms.contractStart).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Contract End</p>
                            <p className="font-medium text-gray-900">
                              {brandTerms.contractEnd
                                ? new Date(brandTerms.contractEnd).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Breakage Policy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Breakage Policy</p>
                            <p className="font-medium text-gray-900">{brandTerms.breakagePolicy || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Breakage Share</p>
                            <p className="font-medium text-gray-900">{brandTerms.breakageShare || 0}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No terms information available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetailsModal;