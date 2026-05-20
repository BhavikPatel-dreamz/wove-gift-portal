import React from "react";
import { currencyList } from "../../../brandsPartner/currency";

const BulkPaymentSummary = ({ 
  currentBulkOrder, 
  quantity, 
  selectedAmount, 
  subtotal,
  serviceFee,
  serviceFeeExVat = 0,
  serviceFeeVat = 0,
  total,
  discountAmount = 0,
  appliedPromo = null,
}) => {

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "R";

  const formatCurrency = (amount) =>
    `${getCurrencySymbol(selectedAmount?.currency)}${Number(amount || 0).toFixed(2)}`;
  
  return (
    <div className="w-full max-w-[19rem] sm:max-w-none mx-auto bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-5 sm:mb-6">Payment Summary</h2>

      {/* Brand Row */}
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentBulkOrder?.selectedBrand?.logo}
            alt="brand"
            className="w-10 h-10 rounded-md object-contain"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm sm:text-base text-gray-900 truncate">{currentBulkOrder?.selectedBrand?.brandName}</span>
            <span className="text-xs sm:text-sm text-gray-500">{quantity} Vouchers</span>
          </div>
        </div>
        <span className="font-semibold text-sm sm:text-base text-gray-900 text-right shrink-0">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Breakdown Section */}
      <div className="space-y-3 text-[13px] sm:text-base text-gray-700">
        {appliedPromo && (
          <div className="flex justify-between items-start gap-3 text-[#ED457D]">
            <span className="leading-5">Promo ({appliedPromo.code})</span>
            <span className="font-semibold text-right">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-start gap-3">
          <span className="leading-5">Subtotal</span>
          <span className="font-semibold text-right">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between items-start gap-3">
          <span className="leading-5">Service Fee excl. VAT 4.35%</span>
          <span className="font-semibold text-right">{formatCurrency(serviceFeeExVat)}</span>
        </div>
        <div className="flex justify-between items-start gap-3">
          <span className="leading-5">VAT on Service Fee 15%</span>
          <span className="font-semibold text-right">{formatCurrency(serviceFeeVat)}</span>
        </div>
        <div className="flex justify-between items-start gap-3">
          <span className="leading-5">Total Service Fee 5% incl. VAT</span>
          {serviceFee === 0 ? (
            <span className="font-semibold text-green-600 text-right">Free</span>
          ) : (
            <span className="font-semibold text-right">{formatCurrency(serviceFee)}</span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-bold text-gray-900">Total to Pay</span>
          <span className="text-xl sm:text-2xl font-bold text-[#F25A5A] text-right">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BulkPaymentSummary;
