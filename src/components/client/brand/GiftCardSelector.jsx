"use client";
import React, { useState } from "react";
import { ArrowLeft, Gift } from "lucide-react";

const GiftCardSelector = ({ brand, voucherData, onSelectGiftCard, onBack }) => {
  const [customAmount, setCustomAmount] = useState(voucherData?.minAmount || 50);
  
  // Check denomination type and get appropriate data
  const isFixedDenomination = voucherData?.denominationype === "fixed";
  const presetAmounts = isFixedDenomination ? voucherData?.denominations || [] : [];
  const minAmount = voucherData?.minAmount || 50;
  const maxAmount = voucherData?.maxAmount || 10000;
  const currency = voucherData?.denominationCurrency || "ZAR";

  const handleAmountClick = (amount) => {
    onSelectGiftCard?.(amount);
  };

  const handleCustomAmountSelect = () => {
    if (customAmount < minAmount || customAmount > maxAmount) {
      alert(`Amount must be between ${currency} ${minAmount} and ${currency} ${maxAmount}`);
      return;
    }
    const customVoucher = { value: customAmount, currency: currency };
    onSelectGiftCard?.(customVoucher);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center text-orange-500 hover:text-orange-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Brands
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            Choose Your Gift Amount
            <Gift className="w-10 h-10 ml-3 text-pink-500" />
          </h1>
          <p className="text-gray-600 text-lg">
            Select the perfect amount for your {brand?.name || 'gift card'}
          </p>
          <div className="mt-4 inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            {isFixedDenomination ? "Fixed Denominations" : `Range: ${currency} ${minAmount} - ${currency} ${maxAmount}`}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
            {isFixedDenomination ? "Select a Voucher" : "Choose Your Amount"}
          </h2>
          <p className="text-gray-600 text-center mb-8">
            {isFixedDenomination ? "Select from available voucher denominations" : `Enter any amount between ${currency} ${minAmount} - ${currency} ${maxAmount}`}
          </p>

          {/* Fixed Denominations */}
          {isFixedDenomination && presetAmounts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {presetAmounts.map((amount) => (
                <button
                  key={amount.id}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md border-orange-400 bg-orange-50`}
                  onClick={() => handleAmountClick(amount)}
                >
                  <div className="text-center">
                    <div className="text-orange-500 mb-2">
                      <span className="text-2xl">🎫</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Voucher</div>
                    <div className="text-xl font-bold text-gray-800">
                      {currency} {amount.value}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Variable Amount Input */}
          {!isFixedDenomination && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Math.max(minAmount, Math.min(maxAmount, parseInt(e.target.value) || minAmount)))}
                    className="w-40 pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg text-center text-xl font-semibold focus:border-orange-400 focus:outline-none"
                    min={minAmount}
                    max={maxAmount}
                    placeholder={minAmount.toString()}
                  />
                </div>
                
                <button
                  onClick={handleCustomAmountSelect}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 flex items-center text-lg"
                >
                  💝 Select
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Amount must be between {currency} {minAmount} and {currency} {maxAmount}
              </p>
            </div>
          )}

          {/* Cancel Button */}
          <div className="text-center mt-8">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardSelector;