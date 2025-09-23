"use client";
import React, { useState } from "react";
import { ArrowLeft, Gift, Sparkles, Check, CreditCard } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ProgressIndicator from "./ProgressIndicator";
import { goBack, goNext, setSelectedAmount } from "../../../redux/giftFlowSlice";
import { Banknote } from "lucide-react";

const GiftCardSelector = () => {
  const dispatch = useDispatch();
  const { selectedBrand } = useSelector((state) => state.giftFlowReducer);

  const voucherData = selectedBrand?.vouchers[0];
  const isFixedDenomination = voucherData?.denominationype === "fixed";
  const presetAmounts = isFixedDenomination ? voucherData?.denominations || [] : [];
  const minAmount = voucherData?.minAmount || 50;
  const maxAmount = voucherData?.maxAmount || 10000;
  const currency = voucherData?.denominationCurrency || "ZAR";

  const [customAmount, setCustomAmount] = useState(minAmount);
  const [localSelectedAmount, setLocalSelectedAmount] = useState(null);

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
    const customVoucher = { value: customAmount, currency: currency };
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
    <div className="min-h-screen bg-wave-cream">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <ProgressIndicator />
        </div>

        <button
          onClick={handleBackClick}
          className="group flex items-center text-wave-brown hover:text-wave-orange transition-all duration-200 hover:translate-x-1"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          Back to Brands
        </button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-wave-orange rounded-2xl opacity-20 blur-xl"></div>
            <h1 className="relative text-5xl font-bold text-wave-green flex items-center justify-center gap-4">
              Choose Your Gift Amount
              <Gift className="w-12 h-12 text-wave-orange animate-pulse" />
            </h1>
          </div>
          <p className="text-xl text-wave-brown mb-6 max-w-2xl mx-auto">
            Select the perfect amount for your <span className="font-semibold text-wave-orange">{selectedBrand?.brandName || 'gift card'}</span>
          </p>
          <div className="inline-flex items-center bg-white text-wave-green px-6 py-3 rounded-full font-semibold shadow-brand border-2 border-wave-orange">
            <Sparkles className="w-4 h-4 mr-2" />
            {isFixedDenomination ? "Fixed Denominations Available" : `Custom Range: ${formatAmount(minAmount)} - ${formatAmount(maxAmount)}`}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-brand-lg border-2 border-wave-cream overflow-hidden">
          <div className="bg-wave-green flex gap-2  items-center justify-center px-8 py-6 border-b border-wave-green-light">
              <CreditCard className="w-7 h-7 text-white" />
            <p className="text-wave-cream text-center">
              {isFixedDenomination ? "Choose from our popular denominations" : `Enter any amount between ${formatAmount(minAmount)} - ${formatAmount(maxAmount)}`}
            </p>
          </div>

          <div className="p-8">
            {isFixedDenomination && presetAmounts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount.id}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-brand-lg transform ${localSelectedAmount?.id === amount.id
                        ? 'border-wave-orange bg-wave-cream shadow-brand'
                        : 'border-wave-cream bg-white hover:border-wave-orange hover:bg-wave-cream'
                      }`}
                    onClick={() => handleAmountClick(amount)}
                  >
                    {localSelectedAmount?.id === amount.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-wave-green text-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    <div className="text-center">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-wave-orange rounded-2xl flex items-center justify-center text-2xl text-white font-bold mx-auto group-hover:scale-110 transition-transform duration-200">
                          <Banknote className="w-8 h-8" />
                        </div>
                      </div>
                      <div className="text-sm text-wave-brown mb-2 font-medium uppercase tracking-wide">Gift Voucher</div>
                      <div className="text-2xl font-bold text-wave-green">
                        {formatAmount(amount.value)}
                      </div>
                      <div className="mt-3 text-xs text-wave-orange font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to select
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isFixedDenomination && (
              <div className="max-w-md mx-auto">
                <div className="bg-wave-cream rounded-2xl p-8 border-2 border-wave-cream-dark">
                  <h3 className="text-lg font-semibold text-wave-green mb-6 text-center">Enter Custom Amount</h3>

                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-wave-green text-xl font-semibold">
                        {currency}
                      </div>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Math.max(minAmount, Math.min(maxAmount, parseInt(e.target.value) || minAmount)))}
                        className="w-48 pl-16 pr-6 py-4 border-2 border-wave-cream rounded-xl text-center text-2xl font-bold focus:border-wave-orange focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all bg-white text-wave-green"
                        min={minAmount}
                        max={maxAmount}
                        placeholder={minAmount.toString()}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCustomAmountSelect}
                    className="w-full bg-wave-orange hover:bg-wave-orange-dark text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-brand hover:shadow-brand-lg hover:scale-105 transform"
                  >
                    <Gift className="w-5 h-5" />
                    Select This Amount
                  </button>

                  <p className="text-sm text-wave-brown mt-4 text-center bg-white rounded-lg py-2 px-4">
                    Amount must be between {formatAmount(minAmount)} and {formatAmount(maxAmount)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-brand">
            <span className="text-wave-green font-medium">🔒 Secure payment</span>
            <div className="w-1 h-1 bg-wave-orange rounded-full"></div>
            <span className="text-wave-green font-medium">⚡ Instant delivery</span>
            <div className="w-1 h-1 bg-wave-orange rounded-full"></div>
            <span className="text-wave-green font-medium">💝 Perfect for gifting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardSelector;