"use client";
import React, { useState } from "react";
import { Gift, Heart, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearDeliveryFormEditReturn, goBack, goNext, setCurrentStep, setSelectedAmount } from "../../../redux/giftFlowSlice";
import { useSearchParams } from "next/navigation";
import { currencyList } from "../../../components/brandsPartner/currency";

const GiftCardSelector = () => {
  const dispatch = useDispatch();
  const { selectedBrand, selectedAmount, selectedOccasion, deliveryFormEditReturn } = useSelector((state) => state.giftFlowReducer);

  const voucherData = selectedBrand?.vouchers[0];
  const denominationType = voucherData?.denominationType;
  const presetAmounts = denominationType !== 'amount' ? voucherData?.denominations || [] : [];
  const minAmount = voucherData?.minAmount || 50;
  const currency = voucherData?.denominationCurrency || "ZAR";

  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  const maxAmount = isBulkMode ? 25000 : 5000;

  const [customAmount, setCustomAmount] = useState(
    selectedAmount && denominationType !== 'fixed' ? selectedAmount.value : 0
  );
  const [localSelectedAmount, setLocalSelectedAmount] = useState(
    selectedAmount || null
  );

  console.log("presetAmounts",presetAmounts)

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "R";

  const goToNextStep = () => {
    if (deliveryFormEditReturn?.enabled) {
      const returnStep = deliveryFormEditReturn?.returnStep || 7;
      dispatch(setCurrentStep(returnStep));
      if (returnStep !== 7) {
        dispatch(clearDeliveryFormEditReturn());
      }
      return;
    }

    if (selectedOccasion) {
      dispatch(setCurrentStep(4));
      return;
    }

    dispatch(goNext());
  };

  const handleAmountClick = (amount) => {
    setLocalSelectedAmount(amount);
    dispatch(setSelectedAmount(amount));
    setTimeout(() => {
      goToNextStep();
    }, 300);
  };

  const handleCustomAmountSelect = () => {
    if (customAmount < minAmount || customAmount > maxAmount) {
      alert(
        `Amount must be between ${getCurrencySymbol(currency)} ${minAmount} and ${getCurrencySymbol(currency)} ${maxAmount}`
      );
      return;
    }

    const customVoucher = {
      id: `custom-${Date.now()}`,
      value: customAmount,
      currency: currency,
    };

    setLocalSelectedAmount(customVoucher);
    dispatch(setSelectedAmount(customVoucher));

    setTimeout(() => {
      goToNextStep();
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
    <div className="min-h-screen bg-white bg-[linear-gradient(126deg,rgba(251,220,227,0.4)_31.7%,rgba(253,230,219,0.4)_87.04%)] px-4 pt-5 pb-10 sm:py-24 md:py-30">
      <div className="max-w-7xl mx-auto sm:px-6">

        {/* Back Button and Bulk Mode Indicator */}
        <div className="relative hidden flex-col items-start gap-4 mb-6 md:flex md:flex-row md:items-center md:justify-between md:gap-0">
          {/* Previous Button */}
          <button
            className="
              relative inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-full font-semibold text-base
              text-[#4A4A4A] bg-transparent border border-transparent
              transition-all duration-300 overflow-hidden group cursor-pointer
              mb-4 md:mb-0
            "
            onClick={() => dispatch(goBack())}
          >
            <span className="absolute inset-0 rounded-full p-[1.5px] bg-linear-to-r from-[#ED457D] to-[#FA8F42]" />
            <span className="absolute inset-0.5 rounded-full bg-[#fdf1f3] transition-all duration-300 group-hover:bg-linear-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]" />
            <div className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 group-hover:[&>path]:fill-white">
                  <path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="currentColor" />
                </svg>
              </span>
              Previous
            </div>
          </button>

          {/* Bulk Gifting Indicator */}
          {isBulkMode && (
            <div className="flex items-center gap-3 justify-center w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto p-2">
              <div className="hidden md:block w-30 h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />
              <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">Bulk Gifting</span>
                </div>
              </div>
              <div className="hidden md:block w-30 h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
            </div>
          )}

          <div className="hidden md:block w-35" />
        </div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12 px-1 sm:px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-2 mt-1">
            {isBulkMode ? 'Choose Gift Amount (Max 25,000)' : 'Choose Gift Amount (Max 5,000)'}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            Select the perfect amount for your {selectedBrand?.brandName || 'Kecks'} gift card
          </p>
        </div>

        {/* Amount Cards - Using CSS Grid for responsive layout */}
        <div className="w-full  flex justify-center">
          {denominationType !== 'amount' && presetAmounts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 justify-items-stretch mb-8 w-full max-w-3xl mx-auto px-2 sm:px-4">
              {presetAmounts.map((amount) => (
                <div
                  key={amount.id}
                  className="relative rounded-xl group cursor-pointer w-full p-[2px]"
                  onClick={() => handleAmountClick(amount)}
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ED457D] to-[#FA8F42] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <button
                    className={`relative flex min-h-[4.75rem] w-full cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 bg-white px-3 py-3 text-center transition-all duration-200 hover:shadow-md sm:min-h-[5.25rem] sm:px-4 sm:py-4 md:min-h-[5.5rem] ${localSelectedAmount?.id === amount.id
                      ? 'border-[#ED457D] shadow-lg scale-[1.02]'
                      : 'border-gray-200'
                      }`}
                  >
                    {localSelectedAmount?.id === amount.id && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#ED457D] to-[#FA8F42] text-white shadow-sm">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    <div className="text-lg font-bold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                      {getCurrencySymbol(amount.currency)} {Number(amount.value).toLocaleString('en-ZA')}
                    </div>
                    <div className="mt-1 text-[11px] font-medium leading-4 text-gray-500 sm:text-xs">
                     {amount?.displayName}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Amount Input */}
        {denominationType !== 'fixed' && (
          <div className="max-w-3xl mx-auto mt-8 px-4 md:px-0">
            <div className="rounded-2xl p-[2px] bg-gradient-to-r from-[#ED457D] to-[#FA8F42] shadow-sm">
                <div className="bg-white rounded-[14px] p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                  {/* Left: Label */}
                  <div className="shrink-0">
                    <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">
                        Set Custom Amount
                      </h3>
                      {/* Max badge — always visible at a glance */}
                      <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#ED457D]/10 to-[#FA8F42]/10 text-[#ED457D] border border-[#ED457D]/20">
                        Max: {formatAmount(maxAmount)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Enter an amount between {formatAmount(minAmount)} and {formatAmount(maxAmount)}
                    </p>
                  </div>

                  {/* Right: Input + Button */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full md:w-auto">
                    {/* Currency Input + inline validation */}
                    <div className="flex flex-col gap-1 flex-1 md:flex-none md:w-50">
                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 text-base font-medium select-none">
                          {getCurrencySymbol(currency)}
                        </div>
                        <input
                          type="number"
                          value={customAmount === 0 || customAmount ? customAmount : 0}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // When the field is fully cleared (e.g. via backspace), default to 0
                            setCustomAmount(raw === "" ? 0 : Number(raw));
                          }}
                          min={minAmount}
                          max={maxAmount}
                          className={`
                    w-full pl-8 pr-4 py-2.5
                    rounded-3xl border
                    text-base font-medium bg-white text-gray-900
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none
                    ${customAmount < minAmount || customAmount > maxAmount
                              ? 'border-red-400 ring-2 ring-red-200 focus:ring-2 focus:ring-red-300 focus:border-red-400'
                              : 'border-[#1A1A1A33] focus:ring-2 focus:ring-[#ED457D]/20 focus:border-[#ED457D]/50'
                            }
                  `}
                          placeholder="Enter amount"
                        />
                      </div>
                      {/* Inline validation message */}
                      {(customAmount < minAmount || customAmount > maxAmount) && (
                        <p className="text-xs text-red-500 font-medium pl-2 flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8.75 11H7.25V9.5H8.75V11ZM8.75 8H7.25V5H8.75V8Z" fill="#ef4444" />
                          </svg>
                          {customAmount < minAmount
                            ? `Minimum amount is ${formatAmount(minAmount)}`
                            : `Maximum amount is ${formatAmount(maxAmount)}`
                          }
                        </p>
                      )}
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={handleCustomAmountSelect}
                      className="
                group cursor-pointer
                shrink-0
                bg-gradient-to-r from-[#ED457D] to-[#FA8F42]
                text-white font-semibold text-sm md:text-base
                px-6 py-2.5
                rounded-full
                transition-all duration-300
                shadow-sm hover:shadow-md hover:opacity-90
                flex items-center justify-center gap-2
                text-center
                w-full md:w-auto
                self-start md:self-center
              "
                    >
                      Select
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-xs font-medium text-slate-500 sm:mt-10 sm:text-sm">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#ED457D]" aria-hidden="true" />
            <span>Secure checkout</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#ED457D]" aria-hidden="true" />
            <span>Instant delivery</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <Heart className="h-4 w-4 text-[#ED457D]" aria-hidden="true" />
            <span>Perfect gift</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardSelector;
