import React from "react";

const BulkPaymentSummary = ({ 
  currentBulkOrder, 
  quantity, 
  selectedAmount, 
  calculateServiceFee, 
  calculateTotal 
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h2>

      {/* Brand Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img
            src={currentBulkOrder?.selectedBrand?.logo}
            alt="brand"
            className="w-10 h-10 rounded-md object-contain"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{currentBulkOrder?.selectedBrand?.brandName}</span>
            <span className="text-sm text-gray-500">{quantity} Vouchers</span>
          </div>
        </div>
        <span className="font-semibold text-gray-900">
          {selectedAmount?.currency}{calculateTotal()}
        </span>
      </div>

      {/* Breakdown Section */}
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between items-center">
          <span>Vouchers ({quantity} × {selectedAmount?.currency}{selectedAmount?.value})</span>
          <span className="font-semibold">{selectedAmount?.currency}{quantity * selectedAmount?.value}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Processing Fee:</span>
          {calculateServiceFee() === 0 ? (
            <span className="font-semibold text-green-600">Free</span>
          ) : (
            <span className="font-semibold">{selectedAmount?.currency}{calculateServiceFee()}</span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-[#F25A5A]">
            {selectedAmount?.currency}{calculateTotal()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BulkPaymentSummary;