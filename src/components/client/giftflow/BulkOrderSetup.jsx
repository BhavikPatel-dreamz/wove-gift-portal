import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { goBack, goNext , setQuantity, setSelectedAmount } from '../../../redux/giftFlowSlice';
import { addToBulk } from '../../../redux/cartSlice';

const BulkOrderSetup = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { selectedBrand,
    selectedAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedTiming,
    selectedSubCategory,
    editingIndex,
    isEditMode,
    selectedOccasion,
    isConfirmed,
    quantity,
  } = useSelector((state) => state.giftFlowReducer);

  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  console.log(selectedBrand, selectedAmount);

  // Get available denominations from selected brand
  const denominations = selectedBrand?.vouchers?.[0]?.denominations || [];

  // Calculate total spend
  const totalSpend = selectedAmount && quantity
    ? (selectedAmount.value * parseInt(quantity || 0)).toFixed(2)
    : '0.00';

  const handleBackToBrands = () => {
    dispatch(goBack());
  };


  const handleDenominationSelect = (denom) => {
    dispatch(setSelectedAmount(denom));
    setError('');
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value || 0);

      // Check maximum limit - Updated to 25000
      if (numValue > 25000) {
        setError('Maximum 25,000 vouchers per order');
        dispatch(setQuantity(value)); // Keep the entered value to show error
      } else {
        dispatch(setQuantity(value));
        setError('');
      }
    }
  };

  useEffect(() => {
    if (selectedAmount && selectedAmount.value) {
      const matchingDenomination = denominations.find(d => d.value === selectedAmount.value);
      if (matchingDenomination) {
        dispatch(setSelectedAmount(matchingDenomination));
      } else {
        // It's a custom amount, so use the selectedAmount object from Redux.
        dispatch(setSelectedAmount(selectedAmount));
      }
    }
  }, [selectedAmount, denominations]);


  const handleAddToBulkOrder = () => {
    // Validation
    if (!selectedAmount) {
      setError('Please select a denomination');
      return;
    }

    if (!quantity || parseInt(quantity) === 0) {
      setError('Please enter quantity');
      return;
    }

    if (parseInt(quantity) < 1) {
      setError('Minimum quantity is 1');
      return;
    }

    // Create bulk order item
    const bulkOrderItem = {
      selectedBrand,
      selectedAmount: {
        value: selectedAmount.value,
        currency: selectedAmount.currency || 'R'
      },
      quantity: parseInt(quantity),
      totalSpend: parseFloat(totalSpend),
      deliveryMethod: 'bulk', // Special flag for bulk orders
      isBulkOrder: true,
      personalMessage,
      deliveryMethod,
      deliveryDetails,
      selectedTiming,
      selectedSubCategory,
      selectedOccasion,
      deliveryMethod: 'bulk', // Special flag for bulk orders
      isBulkOrder: true
    };

    // Dispatch to cart
    dispatch(addToBulk(bulkOrderItem));

    // Reset and navigate
    dispatch(goNext());

  };

  if (!selectedBrand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4  py-30">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No brand selected</p>
          <button
            onClick={() => router.push('/gift')}
            className="text-pink-500 hover:text-pink-600 font-semibold"
          >
            Select a Brand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4  py-30 md:px-8 md:py-30">
      <div className="max-w-7xl mx-auto  sm:px-6">
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
                bg-gradient-to-r from-[#ED457D] to-[#FA8F42]
              "
            ></span>
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
              <div className="md:block w-30 h-px bg-gradient-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />

              <div className="rounded-full p-px bg-gradient-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    Bulk Gifting
                  </span>
                </div>
              </div>

              <div className="md:block w-30 h-px bg-gradient-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
            </div>
          )}

          {/* Desktop spacer only */}
          <div className="md:block w-[140px]" />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[40px] md:text-4xl font-bold text-[#1A1A1A] mb-2 fontPoppins">
            Set up your bulk order
          </h1>
          <p className="text-[#4A4A4A] text-base font-medium">
            We'll generate unique codes for each voucher, ready for you to send out.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-4xl m-auto w-full grid grid-cols-1 md:grid-cols-[275px_1fr] gap-6">
          {/* Left Column - Selected Brand */}
          <div className="w-full flex justify-center">
            <div className="flex flex-col items-center text-center justify-center
                  max-w-[275px] w-full
                  rounded-[20px] p-6 border-[1.2px] border-[#1A1A1A33]
                  shadow-sm bg-[#F9F9F9]">

              {/* Title */}
              <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">
                Selected Brand
              </h3>

              {/* Brand Logo */}
              <div className="w-24 h-24 flex items-center justify-center mb-4">
                {selectedBrand.logo ? (
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.brandName || selectedBrand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-5xl">
                      {(selectedBrand.brandName || selectedBrand.name || 'B')
                        .substring(0, 1)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-b border-[#D0CECE] h-px w-full my-4"></div>

              {/* Tagline */}
              <div className="py-[5px] px-[11px] bg-[#AA42FA1A] rounded-[50px] mb-[18px]">
                <div className="text-[#AA42FA] text-[14px] font-bold">{selectedBrand.tagline}</div>
              </div>

              {/* Brand Name */}
              <h2 className="text-[22px] font-semibold font-['Poppins'] text-[#1A1A1A] mb-3.5">
                {selectedBrand.brandName || selectedBrand.name}
              </h2>

              {/* Category Badge */}
              {selectedBrand.category && (
                <div className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-3">
                  {selectedBrand.category}
                </div>
              )}

              {/* Description */}
              <p className="text-base text-[#4A4A4A] leading-relaxed line-clamp-3">
                {selectedBrand.description || selectedBrand.tagline || 'Premium gift card'}
              </p>
            </div>
          </div>


          {/* Right Column - Order Details */}
          <div className="space-y-6 w-full border-[1.2px] border-[#1A1A1A33] rounded-[20px] p-6 bg-[#DBDBDB2B]">
            {/* Denomination Selection */}
            <div className="">
              <label className="block font-['Inter'] text-[16px] font-semibold leading-[16px] text-[#1A1A1A] mb-3">
                Denomination
              </label>


              <div ref={dropdownRef} className="relative w-full">
                {/* Selected Box */}
                <div
                  onClick={() => setOpen(!open)}
                  className="w-full px-4 py-3 border border-[#1A1A1A33] rounded-[15px] bg-white cursor-pointer flex justify-between items-center"
                >
                  <span className=" text-[14x] font-semibold leading-[16px] text-[#000]">
                    {selectedAmount?.value
                      ? `${selectedAmount.currency} ${selectedAmount.value.toLocaleString()}`
                      : "Select Denomination"}
                  </span>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Dropdown List */}
                {open && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-[15px] shadow-md border border-[#1A1A1A33] z-50 overflow-hidden">
                    {denominations.map((denom, i) => {
                      const isSelected = selectedAmount?.value === denom.value;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            handleDenominationSelect(denom);
                            setOpen(false);
                          }}
                          className={`px-4 py-3 cursor-pointer text-[14x] font-semibold leading-[16px] text-[#000]
                  ${isSelected ? "bg-[#FFECEC] text-red-500 font-semibold" : ""} 
                  hover:bg-gray-100`}
                        >
                          {denom.currency} {denom.value.toLocaleString()}
                        </div>
                      );
                    })}

                    {/* Custom Amount */}
                    <div
                      className="px-4 py-3 cursor-pointer text-[14x] font-semibold leading-[16px] text-[#000] hover:bg-gray-100"
                      onClick={() => {
                        handleDenominationSelect({ value: null });
                        setOpen(false);
                      }}
                    >
                      Custom Amount
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Input */}
            <div className="">
              <label className="block text-base font-semibold text-[#1A1A1A] mb-3">
                Quantity
              </label>

              <input
                type="text"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="e.g., 50 Vouchers"
                className="w-full px-4 py-3 border border-[#1A1A1A33] rounded-[15px] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 bg-white"
              />

              <p className="text-xs text-gray-500 mt-2">
                Maximum 25,000 vouchers per order
              </p>
            </div>

            {/* Total Spend */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white rounded-2xl p-4 sm:p-5 md:p-6 border border-[#1A1A1A33]">
              <div className="flex flex-col">
                <span className="font-['Inter'] text-sm sm:text-base font-bold leading-tight text-[#1A1A1A]">
                  Total Spend
                </span>

                {quantity && selectedAmount && (
                  <span className="font-['Inter'] text-sm sm:text-base font-medium leading-tight text-[#8C8C8C] mt-1 sm:mt-2">
                    {quantity} × {selectedAmount.currency || 'R'}
                    {selectedAmount.value}
                  </span>
                )}
              </div>

              <p className="font-['Inter'] text-lg sm:text-xl font-bold bg-gradient-to-r from-[#ED457D] to-[#FA8F42] bg-clip-text text-transparent text-right sm:text-left">
                {selectedAmount?.currency || 'R'}
                {totalSpend}
              </p>
            </div>


            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Add to Bulk Order Button */}
            <button
              onClick={handleAddToBulkOrder}
              disabled={(!selectedAmount || !quantity || parseInt(quantity) === 0) || parseInt(totalSpend) > 25000}
              className="w-full bg-linear-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Add to Bulk Order {totalSpend}
              <span className="text-xl">
                <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                </svg>
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkOrderSetup;