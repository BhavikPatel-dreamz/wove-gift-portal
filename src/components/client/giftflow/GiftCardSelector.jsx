"use client";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearDeliveryFormEditReturn, goBack, goNext, setCurrentStep, setSelectedAmount } from "../../../redux/giftFlowSlice";
import { useSearchParams } from "next/navigation";
import { currencyList } from "../../../components/brandsPartner/currency";

const GiftCardSelector = () => {
  const dispatch = useDispatch();
  const { selectedBrand, selectedAmount, deliveryFormEditReturn } = useSelector((state) => state.giftFlowReducer);

  const voucherData = selectedBrand?.vouchers[0];
  const denominationType = voucherData?.denominationType;
  const presetAmounts = denominationType !== 'amount' ? voucherData?.denominations || [] : [];
  const minAmount = voucherData?.minAmount || 50;
  const currency = voucherData?.denominationCurrency || "ZAR";

  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  // Set max amount based on mode: 5000 for individual, 25000 for bulk
  const maxAmount = isBulkMode ? 25000 : 5000;

  const [customAmount, setCustomAmount] = useState(
    selectedAmount && denominationType !== 'fixed' ? selectedAmount.value : minAmount
  );
  const [localSelectedAmount, setLocalSelectedAmount] = useState(
    selectedAmount || null
  );

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
        `Amount must be between ${getCurrencySymbol(
          currency
        )} ${minAmount} and ${getCurrencySymbol(currency)} ${maxAmount}`
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
    <div className="min-h-screen bg-white bg-[linear-gradient(126deg,rgba(251,220,227,0.4)_31.7%,rgba(253,230,219,0.4)_87.04%)] py-30 px-4">
      <div className="max-w-7xl mx-auto sm:px-6">
        {/* Back Button and Bulk Mode Indicator */}
        <div className="relative flex flex-col items-start gap-4 mb-6
                md:flex-row md:items-center md:justify-between md:gap-0">

          {/* Previous Button */}
          <button
            className="
              relative inline-flex items-center justify-center gap-2
              px-5 py-3 rounded-full font-semibold text-base
              text-[#4A4A4A] bg-white border border-transparent
              transition-all duration-300 overflow-hidden group cursor-pointer
            "
            onClick={() => dispatch(goBack())}
          >
            {/* Outer gradient border */}
            <span
              className="
                absolute inset-0 rounded-full p-[1.5px]
                bg-linear-to-r from-[#ED457D] to-[#FA8F42]
              "
            ></span>
            <span
              className="
                absolute inset-0.5 rounded-full bg-white
                transition-all duration-300
                group-hover:bg-linear-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]
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
              Previous
            </div>
          </button>

          {/* Bulk Gifting Indicator */}
          {isBulkMode && (
            <div
              className="
        flex items-center gap-3 justify-center w-full
        md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto p-2
      "
            >
              <div className="md:block w-30 h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />

              <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    Bulk Gifting
                  </span>
                </div>
              </div>

              <div className="md:block w-30 h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
            </div>
          )}

          {/* Desktop spacer only */}
          <div className="md:block w-35" />
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 mt-1 sm:mt-2">
            {isBulkMode
              ? 'Choose Gift Amount (Max 25,000)'
              : 'Choose Gift Amount (Max 5,000)'}
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Select the perfect amount for your {selectedBrand?.brandName || 'Kecks'} gift card
          </p>
        </div>


        {/* Amount Cards */}
        {denominationType !== 'amount' && presetAmounts.length > 0 && (
          <div className="flex justify-center gap-4 flex-wrap">
            {presetAmounts.map((amount) => (
              <button
                key={amount.id}
                className={`cursor-pointer relative bg-white rounded-xl border-2 p-8 w-45 transition-all duration-200 hover:shadow-md ${localSelectedAmount?.id === amount.id
                  ? 'border-purple-400 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => handleAmountClick(amount)}
              >
                {/* Gift Box Emoji */}
                <div className="flex justify-center mb-5">
                  <div className="text-5xl">
                    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1065_2944)">
                        <path d="M41.9999 46.348V83.9445L26.1932 76.6982L24.0922 75.7365L15.9154 71.9891L15.4581 71.7787L2.02734 65.6198V27.9708L15.9154 34.3547L26.1932 39.0813L41.9999 46.348Z" fill="#ED457D" />
                        <path d="M81.9726 27.9708V65.6198L70.1407 71.0596L67.1604 72.4305L61.5066 75.0291L56.8826 77.1571L42 84V46.348L56.8826 39.5052L67.1604 34.7815L81.9726 27.9708Z" fill="#FF81AB" />
                        <path d="M26.1928 39.0813V76.6982L24.0918 75.7365L15.915 71.9891V34.3547L26.1928 39.0813Z" fill="#FFF380" />
                        <path d="M67.1601 34.7815V72.4305L61.5064 75.0291L56.8823 77.1571V39.5052L67.1601 34.7815Z" fill="#FFF380" />
                        <path d="M84 19.3974V30.7564L69.0087 37.649L58.7277 42.3756L42 50.0662L24.3481 41.9518L14.0672 37.2252L0 30.7564V19.3974L14.0672 25.8632L24.3481 30.5898L42 38.7043L58.7277 31.0137L69.0087 26.29L84 19.3974Z" fill="#FF8A0E" />
                        <path d="M84 19.3945L42 38.7043L0 19.3945L42 0L84 19.3945Z" fill="#FFB465" />
                        <path d="M24.3483 30.5898V41.9517L14.0674 37.2252V25.8632L24.3483 30.5898Z" fill="#FFEA26" />
                        <path d="M69.0085 26.29V37.649L58.7275 42.3756V31.0137L69.0085 26.29Z" fill="#FFEA26" />
                        <path d="M14.0674 25.8633L41.6817 14.8199L51.8571 19.5172L24.3483 30.5899L14.0674 25.8633Z" fill="#FFF8B5" />
                        <path d="M69.9165 25.8633L44.5128 13.7146L34.3374 18.412L59.6356 30.5898L69.9165 25.8633Z" fill="#FFF8B5" />
                        <path d="M42 17.1087C42 17.1087 36.9282 21.6073 34.0278 31.7795L31.4472 28.2163L27.29 31.724C27.29 31.724 27.29 22.6625 37.2032 17.1087H42Z" fill="#B3610A" />
                        <path d="M42.3193 17.1087C42.3193 17.1087 47.3911 21.6073 50.2915 31.7795L52.8721 28.2163L57.0293 31.724C57.0293 31.724 57.0293 22.6625 47.116 17.1087H42.3193Z" fill="#B3610A" />
                        <path d="M40.4013 14.1856V17.401C30.8079 20.324 24.0925 19.1548 21.5343 15.9394C20.8659 15.1034 20.2679 14.0073 19.8714 12.8351C18.749 9.50578 19.2926 5.55672 24.7321 5.12411C32.087 4.5395 40.4013 14.1856 40.4013 14.1856Z" fill="#B3610A" />
                        <path d="M40.401 17.3922V17.401C30.8076 20.324 24.0922 19.1548 21.534 15.9394C20.8656 15.1034 20.2676 14.0073 19.8711 12.8352C20.6578 11.6893 22.0872 10.8621 24.412 10.6779C29.586 10.2658 36.6628 14.7176 40.401 17.3922Z" fill="#7B4001" />
                        <path d="M43.5991 14.1856V17.401C53.1925 20.324 59.9079 19.1548 62.4662 15.9394C63.1345 15.1034 63.7325 14.0073 64.129 12.8351C65.2515 9.50578 64.7078 5.55672 59.2684 5.12411C51.9134 4.5395 43.5991 14.1856 43.5991 14.1856Z" fill="#B3610A" />
                        <path d="M43.5991 17.3922V17.401C53.1925 20.324 59.9079 19.1548 62.4662 15.9394C63.1345 15.1034 63.7325 14.0073 64.129 12.8352C63.3424 11.6893 61.913 10.8621 59.5882 10.6779C54.4141 10.2658 47.3374 14.7176 43.5991 17.3922Z" fill="#7B4001" />
                        <path d="M40.0813 17.401C40.0813 17.401 38.8022 13.3087 42 13.3087C45.1978 13.3087 43.9186 17.401 43.9186 17.401C43.9186 17.401 42.3197 18.8625 40.0813 17.401Z" fill="#FF8A0E" />
                      </g>
                      <defs>
                        <clipPath id="clip0_1065_2944">
                          <rect width="84" height="84" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Dotted Line */}
                <div className="border-t border-dashed border-gray-300 mb-5"></div>

                {/* Amount */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {getCurrencySymbol(amount.currency)}{amount.value}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom Amount Input */}
        {denominationType !== 'fixed' && (
          <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-0">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                {/* Left side - Text */}
                <div className="shrink-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Set Custom Amount
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose your own amount (max {formatAmount(maxAmount)})
                  </p>
                </div>

                {/* Right side - Input and Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">

                  {/* Input */}
                  <div className="relative w-full sm:w-72">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 text-base font-medium">
                      {getCurrencySymbol(currency)}
                    </div>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-[#1A1A1A33] rounded-3xl text-base font-medium transition-all bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="Enter Your Amount"
                    />
                  </div>

                  {/* Button */}
                  <button
                    onClick={handleCustomAmountSelect}
                    className="cursor-pointer w-full sm:w-auto bg-linear-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-6 py-3 rounded-3xl font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    Select
                    <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                    </svg>

                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardSelector;
