import React from "react";
import { currencyList } from "../brandsPartner/currency";
import SettlementDashboard from "./SettlementDashboard";

const OverviewTab = ({ settlement }) => {
    const getCurrencySymbol = (code) =>
        currencyList.find((c) => c.code === code)?.symbol || "$";

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

  return (
        <>
            <div className="space-y-6">
                {/* Top Row - Settlement Period and Payment Information */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Settlement Period */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <h3 className="text-base font-semibold text-gray-900">Settlement Period</h3>
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Period</p>
                            <p className="text-sm font-medium text-gray-900 border-b  border-[#D8D8D8] pb-2">
                                {formatDate(settlement.periodStart)} - {formatDate(settlement.periodEnd)}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-b border-[#D8D8D8] pb-2">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatDate(settlement.periodStart)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">End Date</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatDate(settlement.periodEnd)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <h3 className="text-base font-semibold text-gray-900">Payment Information</h3>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Period</p>
                            <span className="inline-block rounded bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                                {settlement.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Financial Breakdown */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <h3 className="text-base font-semibold text-gray-900">Financial Breakdown</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Base Amount</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {getCurrencySymbol(settlement.currency)}{settlement.baseAmount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                                Commission ({settlement.commissionValue}{settlement.commissionType === "Percentage" ? "%" : ""})
                            </span>
                            <span className="text-sm font-semibold text-red-600">
                                -{getCurrencySymbol(settlement.currency)}{settlement.commissionAmount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Breakage</span>
                            <span className="text-sm font-semibold text-green-600">
                                +{getCurrencySymbol(settlement.currency)}{settlement.breakageAmount.toLocaleString()}
                            </span>
                        </div>
                        {settlement.vatAmount > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">VAT (5%)</span>
                                <span className="text-sm font-semibold text-red-600">
                                    -{getCurrencySymbol(settlement.currency)}{settlement.vatAmount.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {settlement.adjustments !== 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Adjustments</span>
                                <span className={`text-sm font-semibold ${settlement.adjustments > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {settlement.adjustments > 0 ? '+' : ''}{getCurrencySymbol(settlement.currency)}{Math.abs(settlement.adjustments).toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">Final Net Payable</span>
                            <span className="text-lg font-bold text-blue-600">
                                {getCurrencySymbol(settlement.currency)}{settlement.netPayable.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Voucher and Delivery Summary */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Voucher Summary */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                        <h3 className="mb-4 text-base font-semibold text-blue-700">Voucher Summary</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Total Issued</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {settlement.voucherSummary.totalIssued}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Redeemed</span>
                                <span className="text-sm font-semibold text-teal-600">
                                    {settlement.voucherSummary.redeemed}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Unredeemed</span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {settlement.voucherSummary.unredeemed}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-blue-200 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-blue-700">Redemption Rate</span>
                                <span className="text-sm font-semibold text-blue-600">
                                    {settlement.redemptionRate}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Summary */}
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
                        <h3 className="mb-4 text-base font-semibold text-purple-700">Delivery Summary</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Total</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {settlement.voucherSummary.totalIssued}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Delivered</span>
                                <span className="text-sm font-semibold text-teal-600">
                                    {settlement.voucherSummary.delivered || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Pending</span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {settlement.voucherSummary.pending || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Failed</span>
                                <span className="text-sm font-semibold text-red-600">
                                    {settlement.voucherSummary.failed || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewTab;