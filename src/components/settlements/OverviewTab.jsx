import React from "react";
import { currencyList } from "../brandsPartner/currency";

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5 rounded-xl border border-zinc-200 bg-white p-5">
                    <p className="text-sm font-medium text-zinc-600">Total Sold</p>
                    <p className="text-3xl font-bold tracking-tight text-zinc-900">
                        {getCurrencySymbol(settlement.currency)}{settlement.totalSoldAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-500">{settlement.totalSold} Vouchers</p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-xl border border-zinc-200 bg-white p-5">
                    <p className="text-sm font-medium text-zinc-600">Total Redeemed</p>
                    <p className="text-3xl font-bold tracking-tight text-zinc-900">
                        {getCurrencySymbol(settlement.currency)}{settlement.redeemedAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-500">
                        {settlement.totalRedeemed} Vouchers | {settlement.redemptionRate}%
                    </p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-xl border border-zinc-200 bg-white p-5">
                    <p className="text-sm font-medium text-zinc-600">Outstanding Vouchers</p>
                    <p className="text-3xl font-bold tracking-tight text-[#DC3545]">
                        {getCurrencySymbol(settlement.currency)}{settlement.outstandingAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-500">{settlement.outstanding} Vouchers</p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-xl border border-[#197fe6]/50 bg-[#197fe6]/5 p-5">
                    <p className="text-sm font-medium text-[#197fe6]">Net Payable</p>
                    <p className="text-3xl font-bold tracking-tight text-[#197fe6]">
                        {getCurrencySymbol(settlement.currency)}{settlement.netPayable.toLocaleString()}
                    </p>
                    <p className="text-sm text-[#197fe6]/80">Final settlement amount</p>
                </div>
            </div>
            <div className="w-full rounded-lg bg-zinc-100 p-4 text-center text-zinc-700">
                <p className="text-base font-normal">
                    This is a <span className="font-bold text-zinc-900 capitalize">{settlement?.settlementTrigger}</span> based settlement.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                {/* Left Column */}
                <div className="flex flex-col gap-6 lg:gap-8">
                    <div className="rounded-xl border border-zinc-200 bg-white">
                        <h3 className="border-b border-zinc-200 px-6 py-4 text-lg font-semibold text-zinc-900">
                            Settlement Period Info
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2">
                            <div className="flex flex-col gap-1 p-6 sm:border-r sm:border-zinc-200">
                                <p className="text-sm text-zinc-500">Start Date</p>
                                <p className="text-base font-medium text-zinc-900">
                                    {formatDate(settlement.periodStart)}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1 p-6">
                                <p className="text-sm text-zinc-500">End Date</p>
                                <p className="text-base font-medium text-zinc-900">
                                    {formatDate(settlement.periodEnd)}
                                </p>
                            </div>
                        </div>
                        {settlement.lastRedemptionDate && (
                            <div className="border-t border-zinc-200 flex flex-col gap-1 p-6">
                                <p className="text-sm text-zinc-500">Last Redemption Date</p>
                                <p className="text-base font-medium text-zinc-900">
                                    {formatDate(settlement.lastRedemptionDate)}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white">
                        <h3 className="border-b border-zinc-200 px-6 py-4 text-lg font-semibold text-zinc-900">
                            Financial Breakdown
                        </h3>
                        <div className="space-y-4 p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500">Base Amount</span>
                                <span className="font-medium text-zinc-900">
                                    {getCurrencySymbol(settlement.currency)}{settlement.baseAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500">
                                    Commission ({settlement.commissionValue}{settlement.commissionType === "Percentage" ? "%" : ""})
                                </span>
                                <span className="font-medium text-[#DC3545]">
                                    -{getCurrencySymbol(settlement.currency)}{settlement.commissionAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500">Breakage</span>
                                <span className="font-medium text-[#28A745]">
                                    +{getCurrencySymbol(settlement.currency)}{settlement.breakageAmount.toLocaleString()}
                                </span>
                            </div>
                            {settlement.vatAmount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">VAT (5%)</span>
                                    <span className="font-medium text-[#DC3545]">
                                        -{getCurrencySymbol(settlement.currency)}{settlement.vatAmount.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {settlement.adjustments !== 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">Adjustments</span>
                                    <span className={`font-medium ${settlement.adjustments > 0 ? 'text-[#28A745]' : 'text-[#DC3545]'}`}>
                                        {settlement.adjustments > 0 ? '+' : ''}{getCurrencySymbol(settlement.currency)}{Math.abs(settlement.adjustments).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-zinc-200 p-6 flex items-center justify-between">
                            <span className="font-bold text-zinc-900">Final Net Payable</span>
                            <span className="text-xl font-bold text-[#197fe6]">
                                {getCurrencySymbol(settlement.currency)}{settlement.netPayable.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 lg:gap-8">
                    <div className="rounded-xl border border-zinc-200 bg-white">
                        <h3 className="border-b border-zinc-200 px-6 py-4 text-lg font-semibold text-zinc-900">
                            Payment Information
                        </h3>
                        <div className="divide-y divide-zinc-200 p-6">
                            <div className="flex justify-between py-3">
                                <span className="text-zinc-500">Payment Status</span>
                                <span className={`font-medium ${settlement.status === 'Paid' ? 'text-[#28A745]' :
                                        settlement.status === 'Pending' ? 'text-[#FFC107]' :
                                            'text-[#DC3545]'
                                    }`}>
                                    {settlement.status}
                                </span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-zinc-500">Total Paid Amount</span>
                                <span className="font-medium text-zinc-900">
                                    {getCurrencySymbol(settlement.currency)}{settlement.totalPaid.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-zinc-500">Outstanding Amount</span>
                                <span className="font-medium text-zinc-900">
                                    {getCurrencySymbol(settlement.currency)}{settlement.remainingAmount.toLocaleString()}
                                </span>
                            </div>
                            {settlement.lastPaymentDate && (
                                <div className="flex justify-between py-3">
                                    <span className="text-zinc-500">Last Payment Date</span>
                                    <span className="font-medium text-zinc-900">
                                        {formatDate(settlement.lastPaymentDate)}
                                    </span>
                                </div>
                            )}
                            {settlement.paymentReference && (
                                <div className="flex justify-between py-3">
                                    <span className="text-zinc-500">Payment Reference</span>
                                    <span className="font-mono rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-900">
                                        {settlement.paymentReference}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white">
                        <h3 className="border-b border-zinc-200 px-6 py-4 text-lg font-semibold text-zinc-900">
                            Voucher Summary
                        </h3>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">Total Issued</span>
                                    <span className="font-medium text-zinc-900">
                                        {settlement.voucherSummary.totalIssued}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">Redeemed</span>
                                    <span className="font-medium text-[#28A745]">
                                        {settlement.voucherSummary.redeemed}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">Unredeemed</span>
                                    <span className="font-medium text-[#DC3545]">
                                        {settlement.voucherSummary.unredeemed}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500">Delivery Status</span>
                                    <span className="font-medium text-zinc-900">
                                        {settlement.voucherSummary.deliveryStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="font-medium text-zinc-900">Redemption Rate</span>
                                    <span className="text-zinc-500">{settlement.redemptionRate}%</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-zinc-200">
                                    <div
                                        className="h-2.5 rounded-full bg-[#197fe6]"
                                        style={{ width: `${settlement.redemptionRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewTab;