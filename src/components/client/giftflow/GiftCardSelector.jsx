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
    <div className="min-h-screen bg-[linear-gradient(0deg,#FFFFFF,#FFFFFF),linear-gradient(126.43deg,rgba(251,220,227,0.4)_31.7%,rgba(253,230,219,0.4)_87.04%)] py-30 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}

        <button
          className="
    relative w-full inline-flex items-center justify-center gap-2
    px-5 py-3 rounded-full font-semibold text-base
    text-[#4A4A4A] bg-white border border-transparent
    transition-all duration-300 overflow-hidden group cursor-pointer max-w-[200px]
  "
          onClick={handleBackClick}
        >
          {/* Outer gradient border */}
          <span
            className="
      absolute inset-0 rounded-full p-[1.5px]
      bg-gradient-to-r from-[#ED457D] to-[#FA8F42]
    "
          >

          </span>
          <span
            className="
      absolute inset-[1.5px] rounded-full bg-white
      transition-all duration-300
      group-hover:bg-gradient-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]
    "
          ></span>

          {/* Button content */}
          <div className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
            <svg
              width="8"
              height="9"
              viewBox="0 0 8 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-all duration-300 group-hover:[&>path]:fill-white"
            >
              <path
                d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z"
                fill="url(#paint0_linear_584_1923)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_584_1923"
                  x1="7.5"
                  y1="3.01721"
                  x2="-9.17006"
                  y2="13.1895"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#ED457D" />
                  <stop offset="1" stopColor="#FA8F42" />
                </linearGradient>
              </defs>
            </svg>
            Back to Brands
          </div>
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
