import React from "react";
import { currencyList } from "../../../brandsPartner/currency";

const PaymentSummary = ({ 
  selectedAmount, 
  subtotal,
  total,
  discountAmount = 0,
  appliedPromo = null,
  isBulkMode,
  quantity,
}) => {
  // Helper function to get currency symbol

   const getCurrencySymbol = (code) =>
      currencyList.find((c) => c.code === code)?.symbol || "";

  const getCurrency = () => {
    if (typeof selectedAmount === 'object' && selectedAmount?.currency) {
      return getCurrencySymbol(selectedAmount.currency);
    }
    return 'R';
  };

  const formatCurrency = (amount) => `${getCurrency()}${Number(amount || 0).toFixed(2)}`;

  return (
    <div className="w-full max-w-[19rem] sm:max-w-none mx-auto bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-5 sm:mb-6">Payment summary</h2>

      <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
        {isBulkMode && quantity && (
          <div className="flex justify-between items-start gap-3 text-[13px] sm:text-base text-gray-700">
            <span className="leading-5">Quantity</span>
            <span className="font-semibold text-right">{quantity} voucher{quantity > 1 ? 's' : ''}</span>
          </div>
        )}
        <div className="flex justify-between items-start gap-3 text-[13px] sm:text-base text-gray-700">
          <span className="leading-5">Subtotal</span>
          <span className="font-semibold text-right">{formatCurrency(subtotal)}</span>
        </div>
        {appliedPromo && (
          <div className="flex justify-between items-start gap-3 text-[13px] sm:text-base text-[#ED457D]">
            <span className="leading-5">Promo ({appliedPromo.code})</span>
            <span className="font-semibold text-right">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-bold text-gray-900">Total to Pay</span>
          <span className="text-xl sm:text-2xl font-bold text-[#1A1A1A] text-right">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
