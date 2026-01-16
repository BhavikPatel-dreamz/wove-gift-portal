import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  Gift,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Building,
  Loader,
  Calculator,
  Info,
} from "lucide-react";
import { currencyList } from "../brandsPartner/currency";



const SettlementDetailsModal = ({ isOpen, onClose, brandId, onFetchTabData }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [tabData, setTabData] = useState({
    overview: null,
    vouchers: null,
    contacts: null,
    banking: null,
    terms: null,
  });
  const [tabLoading, setTabLoading] = useState({
    overview: false,
    vouchers: false,
    contacts: false,
    banking: false,
    terms: false,
  });

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "";

  // Load initial overview data when modal opens
  useEffect(() => {
    if (isOpen && brandId && !tabData.overview) {
      loadTabData("overview");
    }
  }, [isOpen, brandId]);

  // Load data when tab changes
  useEffect(() => {
    if (isOpen && brandId && activeTab !== "overview" && !tabData[activeTab]) {
      loadTabData(activeTab);
    }
  }, [activeTab, isOpen, brandId]);

  const loadTabData = async (tab) => {
    setTabLoading((prev) => ({ ...prev, [tab]: true }));
    
    try {
      const response = await onFetchTabData(brandId, tab);
      
      if (response.success) {
        setTabData((prev) => ({ ...prev, [tab]: response.data }));
      }
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (!isOpen) return null;

  const overview = tabData.overview;
  const settlement = overview?.settlement;
  const brand = overview?.brand;
  const summary = overview?.summary;

  // Initial loading state - only show loader when overview is loading
  if (!overview && tabLoading.overview) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading settlement details...</p>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const stats = [
    {
      label: "Total Sold",
      value: `${getCurrencySymbol(brand.currency)}${settlement.totalSoldAmount?.toLocaleString() || 0}`,
      subtext: `${settlement.totalSold} vouchers`,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Redeemed",
      value: `${getCurrencySymbol(brand.currency)}${settlement.redeemedAmount?.toLocaleString() || 0}`,
      subtext: `${settlement.totalRedeemed} vouchers (${settlement.redemptionRate}%)`,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Outstanding",
      value: `${getCurrencySymbol(brand.currency)}${settlement.outstandingAmount?.toLocaleString() || 0}`,
      subtext: `${settlement.outstanding} vouchers pending`,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Net Payable",
      value: `${getCurrencySymbol(brand.currency)}${settlement.netPayable?.toLocaleString() || 0}`,
      subtext: settlement.settlementTriggerDisplay || "Settlement Amount",
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              {brand.logo && (
                <img src={brand.logo} alt={brand.brandName} className="w-12 h-12 rounded-lg" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{brand.brandName}</h2>
                <p className="text-blue-100 text-sm">{settlement.settlementPeriod}</p>
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
                    <p className="text-xl font-bold">{stat.value}</p>
                    {stat.subtext && (
                      <p className="text-xs mt-1 opacity-75">{stat.subtext}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Settlement Trigger Banner */}
            <div className={`mx-6 mt-6 p-4 rounded-lg ${
              settlement.settlementTrigger === "onRedemption" 
                ? "bg-blue-50 border border-blue-200" 
                : "bg-green-50 border border-green-200"
            }`}>
              <div className="flex items-start gap-3">
                <Info className={`w-5 h-5 mt-0.5 ${
                  settlement.settlementTrigger === "onRedemption" ? "text-blue-600" : "text-green-600"
                }`} />
                <div>
                  <h4 className={`font-semibold ${
                    settlement.settlementTrigger === "onRedemption" ? "text-blue-900" : "text-green-900"
                  }`}>
                    Settlement Mode: {settlement.settlementTriggerDisplay}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    settlement.settlementTrigger === "onRedemption" ? "text-blue-700" : "text-green-700"
                  }`}>
                    {settlement.settlementTrigger === "onRedemption" 
                      ? "This brand is paid based on voucher redemptions. Payment is calculated using the redeemed amount."
                      : "This brand is paid based on voucher sales. Payment is calculated using the total sold amount."}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b bg-white sticky top-0 mt-6">
              <div className="flex gap-0 overflow-x-auto">
                {["overview", "vouchers", "contacts", "banking", "terms"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-6 py-4 font-medium whitespace-nowrap transition-colors relative ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tabLoading[tab] && (
                      <Loader className="w-3 h-3 animate-spin absolute top-2 right-2 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && tabData.overview && (
                <OverviewTab 
                  settlement={settlement} 
                  brand={brand} 
                  summary={summary}
                  getCurrencySymbol={getCurrencySymbol}
                />
              )}

              {/* Vouchers Tab */}
              {activeTab === "vouchers" && (
                <>
                  {tabLoading.vouchers && !tabData.vouchers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading vouchers data...</p>
                      </div>
                    </div>
                  ) : (
                    <VouchersTab
                      data={tabData.vouchers}
                      brand={brand}
                      getCurrencySymbol={getCurrencySymbol}
                    />
                  )}
                </>
              )}

              {/* Contacts Tab */}
              {activeTab === "contacts" && (
                <>
                  {tabLoading.contacts && !tabData.contacts ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading contacts data...</p>
                      </div>
                    </div>
                  ) : (
                    <ContactsTab data={tabData.contacts} />
                  )}
                </>
              )}

              {/* Banking Tab */}
              {activeTab === "banking" && (
                <>
                  {tabLoading.banking && !tabData.banking ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading banking data...</p>
                      </div>
                    </div>
                  ) : (
                    <BankingTab data={tabData.banking} />
                  )}
                </>
              )}

              {/* Terms Tab */}
              {activeTab === "terms" && (
                <>
                  {tabLoading.terms && !tabData.terms ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading terms data...</p>
                      </div>
                    </div>
                  ) : (
                    <TermsTab
                      data={tabData.terms}
                      brand={brand}
                      getCurrencySymbol={getCurrencySymbol}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ settlement, brand, summary, getCurrencySymbol }) => {
  const baseAmountLabel = settlement.settlementTrigger === "onRedemption" 
    ? "Redeemed Amount (Base)" 
    : "Sold Amount (Base)";
  const baseAmountValue = settlement.settlementTrigger === "onRedemption"
    ? settlement.redeemedAmount
    : settlement.totalSoldAmount;

  return (
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
            {settlement.lastRedemptionDate && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">Last Redemption</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(settlement.lastRedemptionDate).toLocaleString()}
                </p>
              </div>
            )}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded p-3">
            <p className="text-xs text-blue-600">{baseAmountLabel}</p>
            <p className="text-lg font-semibold text-blue-700">
              {getCurrencySymbol(brand.currency)}{baseAmountValue?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-red-50 rounded p-3">
            <p className="text-xs text-red-600">Commission</p>
            <p className="text-lg font-semibold text-red-700">
              -{getCurrencySymbol(brand.currency)}{settlement.commissionAmount?.toLocaleString() || 0}
            </p>
          </div>
          {settlement.breakageAmount > 0 && (
            <div className="bg-orange-50 rounded p-3">
              <p className="text-xs text-orange-600">Breakage</p>
              <p className="text-lg font-semibold text-orange-700">
                -{getCurrencySymbol(brand.currency)}{settlement.breakageAmount?.toLocaleString() || 0}
              </p>
            </div>
          )}
          {settlement.vatAmount > 0 && (
            <div className="bg-green-50 rounded p-3">
              <p className="text-xs text-green-600">VAT</p>
              <p className="text-lg font-semibold text-green-700">
                +{getCurrencySymbol(brand.currency)}{settlement.vatAmount?.toLocaleString() || 0}
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
  );
};

// Vouchers Tab Component
const VouchersTab = ({ data, brand, getCurrencySymbol }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No voucher data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((voucher, idx) => (
        <div key={idx} className="border rounded-lg p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded p-3">
              <p className="text-xs text-blue-600">Total Issued</p>
              <p className="text-2xl font-bold text-blue-700">{voucher.totalIssued}</p>
              <p className="text-xs text-blue-600 mt-1">{getCurrencySymbol(brand.currency)}{voucher.totalSoldAmount?.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded p-3">
              <p className="text-xs text-green-600">Redeemed</p>
              <p className="text-2xl font-bold text-green-700">{voucher.totalRedeemed}</p>
              <p className="text-xs text-green-600 mt-1">{getCurrencySymbol(brand.currency)}{voucher.totalRedeemedAmount?.toLocaleString()}</p>
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
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount Redeemed</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucher.denominationBreakdown.map((denom, didx) => (
                      <tr key={didx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-black">
                          {getCurrencySymbol(brand.currency)} {denom.value}
                        </td>
                        <td className="px-4 py-2 text-blue-600 font-semibold">{denom.issued}</td>
                        <td className="px-4 py-2 text-green-600 font-semibold">{denom.redeemed}</td>
                        <td className="px-4 py-2 text-green-700 font-semibold">
                          {getCurrencySymbol(brand.currency)}{denom.redeemedAmount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                            {denom.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Contacts Tab Component
const ContactsTab = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No contact information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((contact) => (
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
  );
};

// Banking Tab Component
const BankingTab = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-8">
        <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No banking information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Bank Account Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Account Holder</p>
            <p className="font-medium text-gray-900">{data.accountHolder}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Account Number</p>
            <p className="font-medium text-gray-900">{data.accountNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Bank Name</p>
            <p className="font-medium text-gray-900">{data.bankName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Branch Code</p>
            <p className="font-medium text-gray-900">{data.branchCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Country</p>
            <p className="font-medium text-gray-900">{data.country}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Payout Method</p>
            <p className="font-medium text-gray-900">{data.payoutMethod}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Settlement Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Settlement Frequency</p>
            <p className="font-medium text-gray-900 capitalize">
              {data.settlementFrequency}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Account Verification</p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${data.accountVerification
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                  }`}
              >
                {data.accountVerification ? (
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
  );
};

// Terms Tab Component
const TermsTab = ({ data, brand, getCurrencySymbol, loading }) => {
  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No terms information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Commission & Pricing</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Commission Type</p>
            <p className="font-medium text-gray-900 capitalize">{data.commissionType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Commission Value</p>
            <p className="font-medium text-gray-900">
              {data.commissionType === "Percentage"
                ? `${data.commissionValue}%`
                : `${getCurrencySymbol(brand.currency)} ${data.commissionValue}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Minimum Order Value</p>
            <p className="font-medium text-gray-900">
              {getCurrencySymbol(brand.currency)} {data.minOrderValue?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Maximum Discount</p>
            <p className="font-medium text-gray-900">
              {getCurrencySymbol(brand.currency)} {data.maxDiscount?.toLocaleString() || 0}
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
              {data.settlementTrigger}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">VAT Rate</p>
            <p className="font-medium text-gray-900">{data.vatRate || 0}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Contract Start</p>
            <p className="font-medium text-gray-900">
              {data.contractStart
                ? new Date(data.contractStart).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Contract End</p>
            <p className="font-medium text-gray-900">
              {data.contractEnd
                ? new Date(data.contractEnd).toLocaleDateString()
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
            <p className="font-medium text-gray-900">{data.breakagePolicy || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Breakage Share</p>
            <p className="font-medium text-gray-900">{data.breakageShare || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetailsModal;
