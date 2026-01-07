import React from "react";

const PaymentSummary = ({ 
  selectedAmount, 
  formatAmount, 
  calculateServiceFee, 
  calculateTotal,
  isBulkMode,
  quantity
}) => {
  // Helper function to get currency symbol
  const getCurrency = () => {
    if (typeof selectedAmount === 'object' && selectedAmount?.currency) {
      return selectedAmount.currency;
    }
    return 'R';
  };

  // Helper function to get numeric value
  const getAmountValue = (amount) => {
    if (typeof amount === 'object' && amount?.value) {
      return amount.value;
    }
    return amount || 0;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Payment summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-gray-700">
          <span>Gift Card Value{isBulkMode ? ' (Each)' : ''}</span>
          <span className="font-semibold">{formatAmount(selectedAmount)}</span>
        </div>
        {isBulkMode && quantity && (
          <div className="flex justify-between items-center text-gray-700">
            <span>Quantity</span>
            <span className="font-semibold">{quantity} voucher{quantity > 1 ? 's' : ''}</span>
          </div>
        )}
        {isBulkMode && quantity && (
          <div className="flex justify-between items-center text-gray-700">
            <span>Subtotal</span>
            <span className="font-semibold">{getCurrency()}{getAmountValue(selectedAmount) * quantity}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-gray-700">
          <span>Service Fee (3%)</span>
          <span className="font-semibold">{getCurrency()}{calculateServiceFee()}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-[#1A1A1A]">{getCurrency()}{calculateTotal()}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;