"use client";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { goBack, goNext, setSelectedAmount } from "../../../redux/giftFlowSlice";
const GiftCardSelector = () => {
  const dispatch = useDispatch();
  const { selectedBrand, selectedAmount } = useSelector((state) => state.giftFlowReducer);

  const voucherData = selectedBrand?.vouchers[0];
  const isFixedDenomination = voucherData?.denominationType === "fixed";
  const presetAmounts = isFixedDenomination ? voucherData?.denominations || [] : [];
  const minAmount = voucherData?.minAmount || 50;
  const maxAmount = voucherData?.maxAmount || 10000;
  const currency = voucherData?.denominationCurrency || "ZAR";

  const [customAmount, setCustomAmount] = useState(
    selectedAmount && !isFixedDenomination ? selectedAmount.value : minAmount
  );
  const [localSelectedAmount, setLocalSelectedAmount] = useState(
    selectedAmount || null
  );

  const handleAmountClick = (amount) => {
    setLocalSelectedAmount(amount);
    dispatch(setSelectedAmount(amount));
    setTimeout(() => {
      dispatch(goNext());
    }, 300);
  };

  const handleCustomAmountSelect = () => {
    if (customAmount < minAmount || customAmount > maxAmount) {
      alert(`Amount must be between ${currency} ${minAmount} and ${currency} ${maxAmount}`);
      return;
    }

    const customVoucher = {
      id: `custom-${Date.now()}`, // unique id
      value: customAmount,
      currency: currency,
    };

    setLocalSelectedAmount(customVoucher);
    dispatch(setSelectedAmount(customVoucher));

    setTimeout(() => {
      dispatch(goNext());
    }, 300);
  };

  const handleBackClick = () => {
    dispatch(goBack());
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white py-30 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-3 px-4 py-3.5 rounded-full border-2 border-rose-400 bg-white hover:bg-rose-50 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ArrowLeft className="w-5 h-5 text-rose-500 group-hover:translate-x-[-2px] transition-transform duration-200" />
          <span className="text-base font-semibold text-gray-800">Back to Brands</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Choose Your Gift Amount
          </h1>
          <p className="text-gray-600 text-base">
            Select the perfect amount for your {selectedBrand?.brandName || 'Kecks'} gift card
          </p>
        </div>

        {/* Amount Cards */}
        {isFixedDenomination && presetAmounts.length > 0 && (
          <div className="flex justify-center gap-6 flex-wrap">
            {presetAmounts.map((amount) => (
              <button
                key={amount.id}
                className={`relative bg-white rounded-2xl border-2 p-8 min-w-[140px] transition-all duration-300 hover:shadow-lg hover:scale-105 ${localSelectedAmount?.id === amount.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => handleAmountClick(amount)}
              >
                {/* Coin Image */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img
                      src="/coin.svg"
                      alt="Coin"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {amount.currency + " " + amount.value}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom Amount Input */}
        {!isFixedDenomination && (
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                Enter Custom Amount
              </h3>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 text-xl font-semibold">
                    {currency}
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-48 pl-12 pr-6 py-4 border-2 border-gray-300 rounded-xl text-center text-2xl font-bold focus:border-orange-500 focus:outline-none transition-all bg-white text-gray-900"
                    min={minAmount}
                    max={maxAmount}
                    placeholder={minAmount.toString()}
                  />
                </div>
              </div>

              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200"
                onClick={handleCustomAmountSelect}
              >
                Select This Amount
              </button>

              <p className="text-sm text-gray-600 mt-4 text-center">
                Amount must be between {formatAmount(minAmount)} and {formatAmount(maxAmount)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardSelector;
