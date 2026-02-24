import React from "react";
import { currencyList } from "../brandsPartner/currency";

const OverviewTab = ({ settlement }) => {
    const getCurrencySymbol = (code) =>
        currencyList.find((c) => c.code === code)?.symbol || "$";

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "0";
        return amount.toLocaleString();
    };

    console.log(settlement, "paymentd");

    return (
        <>
            <div className="space-y-6">
                {/* Top Row - Settlement Period and Payment Information */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Settlement Period */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
                                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <h3 className="text-base font-semibold text-gray-900">Settlement Period</h3>
                        </div>
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Period</p>
                            <p className="text-sm font-medium text-gray-900 border-b border-[#D8D8D8] pb-2">
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
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Frequency</p>
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                    {settlement.frequency}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Settlement Trigger</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {settlement.settlementTrigger === "onRedemption" ? "On Redemption" : "On Purchase"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h3 className="text-base font-semibold text-gray-900">Payment Information</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                <span className={`inline-block rounded px-2.5 py-1 text-xs font-medium ${settlement.status === "Paid"
                                    ? "bg-green-100 text-green-700"
                                    : settlement.status === "Partial"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}>
                                    {settlement.status === "Partial" ? "Partially Paid" : settlement.status}
                                </span>
                            </div>
                            {settlement.lastPaymentDate && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Last Payment Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(settlement.lastPaymentDate)}
                                    </p>
                                </div>
                            )}
                            {/* {settlement.paymentReference && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Payment Reference</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {settlement.paymentReference}
                                    </p>
                                </div>
                            )} */}
                            <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                                    <p className="text-sm font-semibold text-green-600">
                                        {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.totalPaid)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Remaining</p>
                                    <p className="text-sm font-semibold text-orange-600">
                                        {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.remainingAmount)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Payments</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {settlement.paymentCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Row - Financial Breakdown and Payment History */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Financial Breakdown */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
                                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
                                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <h3 className="text-base font-semibold text-gray-900">Financial Breakdown</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                    Base Amount ({settlement.settlementTrigger === "onRedemption" ? "Redeemed" : "Sold"})
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.baseAmount)}
                                </span>
                            </div>
                            {settlement.commissionAmount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">
                                        Commission ({settlement.commissionValue}{settlement.commissionType === "Percentage" ? "%" : ""})
                                    </span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.commissionAmount)}
                                    </span>
                                </div>
                            )}
                            {settlement.vatAmount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">VAT ({settlement.vatRate}%)</span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.vatAmount)}
                                    </span>
                                </div>
                            )}
                            {settlement.breakageAmount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Breakage</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.breakageAmount)}
                                    </span>
                                </div>
                            )}
                            {settlement.adjustments !== 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Adjustments</span>
                                    <span className={`text-sm font-semibold ${settlement.adjustments > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {settlement.adjustments > 0 ? '+' : ''}{getCurrencySymbol(settlement.currency)}{formatCurrency(Math.abs(settlement.adjustments))}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">Final Net Payable</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.netPayable)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-base font-semibold text-gray-900">Payment History</h3>
                            </div>
                            {settlement.paymentCount > 0 && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                                    {settlement.paymentCount} payment{settlement.paymentCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {settlement.paymentHistory && settlement.paymentHistory.length > 0 ? (
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                {settlement.paymentHistory.map((payment, index) => (
                                    <div key={payment.id || index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start ">
                                            <div className="flex items-center gap-6 ">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                                                    <p className="text-sm text-gray-900">
                                                        {formatDateTime(payment.paidAt)}
                                                    </p>
                                                </div>

                                                {payment.notes && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                                                        <p className="text-sm text-gray-700 italic">
                                                            {payment.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-green-600">
                                                {getCurrencySymbol(settlement.currency)}{formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-gray-500">No payment history available</p>
                                <p className="text-xs text-gray-400 mt-1">Payments will appear here once processed</p>
                            </div>
                        )}

                        {/* {settlement.paymentHistory && settlement.paymentHistory.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                                        <p className="text-sm font-semibold text-green-600">
                                            {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.totalPaid)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Remaining</p>
                                        <p className="text-sm font-semibold text-orange-600">
                                            {getCurrencySymbol(settlement.currency)}{formatCurrency(settlement.remainingAmount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )} */}
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
                                    {settlement.voucherSummary?.totalIssued || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Redeemed</span>
                                <span className="text-sm font-semibold text-teal-600">
                                    {settlement.voucherSummary?.redeemed || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Unredeemed</span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {settlement.voucherSummary?.unredeemed || 0}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-blue-200 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-blue-700">Redemption Rate</span>
                                <span className="text-sm font-semibold text-blue-600">
                                    {settlement.redemptionRate || 0}%
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
                                    {settlement.voucherSummary?.totalIssued || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Delivered</span>
                                <span className="text-sm font-semibold text-teal-600">
                                    {settlement.voucherSummary?.delivered || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Pending</span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {settlement.voucherSummary?.pending || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Failed</span>
                                <span className="text-sm font-semibold text-red-600">
                                    {settlement.voucherSummary?.failed || 0}
                                </span>
                            </div>
                        </div>
                        {/* <div className="mt-4 border-t border-purple-200 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-purple-700">Status</span>
                                <span className="text-sm font-semibold text-purple-600">
                                    {settlement.voucherSummary?.deliveryStatus || "Pending"}
                                </span>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewTab;