"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { X, CheckCircle, Loader2, AlertCircle, DollarSign, Search, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomDropdown from '../ui/CustomDropdown';
import { currencyList } from '../brandsPartner/currency';
import { processSettlement } from "@/lib/action/analytics";

const BrandAnalyticsTable = ({
  initialBrands = [],
  initialSummary = {},
  initialPeriod = 'year',
  brandsList = []
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [brands, setBrands] = useState(initialBrands);
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const currentBrandId = searchParams.get('brandId') || '';

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  // Prepare brand options
  const brandOptions = brandsList.map(brand => ({
    value: brand.id,
    label: brand.brandName
  }));


  const currentMonth = searchParams.get('filterMonth') || null;
  const currentYear = searchParams.get('filterYear') || null;
  const currentSearch = searchParams.get('search') || '';

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return { value: year?.toString(), label: year?.toString() };
    });
  }, []);

  const updateQueryParams = (key, value) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value) {
      params.set(key, value);
      if (key === 'filterMonth' && value) {
        params.delete('filterYear');
      } else if (key === 'filterYear' && value) {
        params.delete('filterMonth');
      }
    } else {
      params.delete(key);
    }
    router.push(`?${params?.toString()}`);
  };


  const handleBrandFilter = (value) => {
    updateQueryParams('brandId', value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    updateQueryParams('search', value);
  };

  const handleMonthChange = (monthValue) => {
    updateQueryParams('filterMonth', monthValue);
  };


  const handleProcessSettlement = async () => {
    console.log(selectedBrand, "selectedBrand");
    if (!selectedBrand?.id) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setProcessMessage({ type: 'error', text: 'Please enter a valid payment amount' });
      return;
    }

    if (amount > selectedBrand.remainingAmount) {
      setProcessMessage({ type: 'error', text: 'Payment amount cannot exceed outstanding amount' });
      return;
    }

    try {
      setProcessing(true);
      setProcessMessage(null);

      const result = await processSettlement(
        selectedBrand.id,
        amount,
        paymentNotes.trim() || undefined
      );

      if (result.success) {
        setProcessMessage({
          type: "success",
          text: `Payment processed successfully! ${result.data.paymentReference
            ? `Payment Reference: ${result.data.paymentReference}`
            : ""
            }`,
        });
      } else {
        throw new Error(result.message || "Failed to process payment");
      }
    } catch (err) {
      console.error("Process settlement error:", err);
      setProcessMessage({ type: 'error', text: err.message || 'Failed to process settlement' });
    } finally {
      setProcessing(false);
    }
  };

  const openProcessModal = (brand) => {

    setSelectedBrand(brand);
    setPaymentAmount(brand.remainingAmount?.toString());
    setIsPartialPayment(false);
    setShowModal(true);
    resetModalState();
  };

  const resetModalState = () => {
    setProcessMessage(null);
    setPaymentNotes('');
  };

  const closeModal = () => {
    if (!processing) {
      setShowModal(false);
      setSelectedBrand(null);
      setPaymentAmount('');
      setIsPartialPayment(false);
      resetModalState();
    }
  };

  const handlePaymentTypeChange = (isPartial) => {
    setIsPartialPayment(isPartial);
    if (!isPartial && selectedBrand) {
      setPaymentAmount(selectedBrand.remainingAmount?.toString());
    } else {
      setPaymentAmount('');
    }
  };

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "$";

  const formatCurrency = (amount, currency = 'ZAR') => {
    if (currency === 'ZAR') {
      return `R${Math.round(amount).toLocaleString()}`;
    }
    return `${getCurrencySymbol(currency)} ${Math.round(amount).toLocaleString()}`;
  };

  const calculateRemaining = () => {
    if (!selectedBrand || !paymentAmount) return 0;
    const amount = parseFloat(paymentAmount);
    return isNaN(amount) ? selectedBrand.remainingAmount : selectedBrand.remainingAmount - amount;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="max-w-400 mx-auto px-6 py-8">

        {/* Header */}
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Title */}
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
            Analytics & Performance Tracking
          </h1>

          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                defaultValue={currentSearch}
                onChange={handleSearchChange}
                placeholder="Search by code, user email or status"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="relative">
              <CustomDropdown
                options={brandOptions}
                placeholder="All Brands"
                value={currentBrandId}
                onChange={handleBrandFilter}
                className="w-full min-w-40"
              />
            </div>


            {/* Month Dropdown */}
            <div className="relative w-full sm:w-auto">
              <CustomDropdown
                value={monthOptions.find(m => m.value === currentMonth)?.label || 'Select Month'}
                onChange={(value) => handleMonthChange(value)}
                options={monthOptions}
                placeholder="Select Month"
                className="min-w-40 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}


        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Issued</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Redeemed</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Redemption Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pending Settlement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.length > 0 ? (
                  brands.map((brand, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {brand?.brand?.logo ? (
                            <img
                              src={brand?.brand?.logo}
                              alt={brand?.brand?.name || "Brand"}
                              className="w-8 h-8 object-contain rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-700 font-semibold text-sm">
                              {brand?.brand?.brandName?.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{brand?.brand?.brandName || "Brand"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{brand.totalSold || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-md font-medium text-sm">
                          {formatCurrency(brand.totalSoldAmount || 0, brand.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-medium">
                            {formatCurrency(brand.redeemedAmount || 0, brand.currency)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{brand.totalSoldAmount && brand.redeemedAmount ? `${((brand.redeemedAmount / brand.totalSoldAmount) * 100).toFixed(2)}%` : "0%"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-md font-medium text-sm">
                            {formatCurrency(brand.remainingAmount || 0, brand.currency)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openProcessModal(brand)}
                          disabled={brand.remainingAmount == 0}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${brand.remainingAmount !== 0
                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          Process Settlement
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="font-medium mb-1">No brand data available</p>
                        <p className="text-sm">Data will appear once orders are completed</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Settlement Modal */}
      {showModal && selectedBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Process Settlement
              </h3>
              <button
                onClick={closeModal}
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              {processMessage ? (
                <div className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${processMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
                  }`}>
                  {processMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${processMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {processMessage.text}
                  </p>
                </div>
              ) : (
                <>
                  {/* Brand Info */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      {selectedBrand.brand.logo && (
                        <img
                          src={selectedBrand.brand.logo}
                          alt={selectedBrand.brand.brandName}
                          className="w-10 h-10 object-contain"
                        />
                      )}
                      <span className="font-semibold text-gray-900 text-lg">
                        {selectedBrand.brand.brandName}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Issued:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(selectedBrand.totalSoldAmount, selectedBrand.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Redeemed:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(selectedBrand.redeemedAmount, selectedBrand.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-900 font-medium">Total Pending:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(selectedBrand.remainingAmount, selectedBrand.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePaymentTypeChange(false)}
                        className={`p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${!isPartialPayment
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`block ${!isPartialPayment ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                          <rect width="30" height="30" rx="6" fill="currentColor" fillOpacity="0.1" />
                          <g clip-path="url(#clip0_4204_1064)">
                            <path d="M16.9972 13.592C16.9972 14.8544 16.602 15.1584 15.1416 15.1584H13.5752V11.9492H15.14C16.602 11.9492 16.9972 12.3448 16.9972 13.592Z" fill="currentColor" />
                            <path d="M5.5 15.5C5.5 21.0228 9.9772 25.5 15.5 25.5C21.0228 25.5 25.5 21.0228 25.5 15.5C25.5 9.9772 21.0228 5.5 15.5 5.5C9.9772 5.5 5.5 9.9772 5.5 15.5ZM20.0088 21.5H17.636C17.2864 21.5 17.1796 21.3936 17.0276 21.1652L14.5476 17.2564H13.5752V21.2564C13.5752 21.4544 13.5296 21.5 13.3472 21.5H10.9896C10.8072 21.5 10.7616 21.4544 10.7616 21.2564V9.8964C10.7616 9.7444 10.8072 9.6988 10.9896 9.6836C12.48 9.5636 14.0012 9.5012 15.446 9.5012C18.7312 9.5012 19.8564 10.5048 19.8564 13.5012C19.8564 15.7368 19.2636 16.7104 17.6056 17.0752L20.1912 21.1952C20.3128 21.3644 20.2368 21.5 20.0088 21.5Z" fill="currentColor" />
                          </g>
                          <defs>
                            <clipPath id="clip0_4204_1064">
                              <rect width="20" height="20" fill="white" transform="translate(5.5 5.5)" />
                            </clipPath>
                          </defs>
                        </svg>
                        <div className="font-medium text-gray-900">Full Payment</div>
                        <div className="text-xs text-gray-500 mt-1">Pay entire amount</div>
                      </button>
                      <button
                        onClick={() => handlePaymentTypeChange(true)}
                        className={`p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${isPartialPayment
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`block ${isPartialPayment ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                          <rect width="30" height="30" rx="6" fill="currentColor" fillOpacity="0.1" />
                          <g clip-path="url(#clip0_4204_1077)">
                            <path d="M19.2276 10.716C19.2276 11.3998 19.0135 11.5645 18.2225 11.5645H17.374V9.82617H18.2216C19.0135 9.82617 19.2276 10.0405 19.2276 10.716Z" fill="currentColor" />
                            <path d="M13 11.7497C13 14.7412 15.4251 17.1663 18.4167 17.1663C21.4082 17.1663 23.8333 14.7412 23.8333 11.7497C23.8333 8.75816 21.4082 6.33301 18.4167 6.33301C15.4251 6.33301 13 8.75816 13 11.7497ZM20.8589 14.9997H19.5737C19.3843 14.9997 19.3264 14.942 19.2441 14.8183L17.9008 12.7011H17.3741V14.8677C17.3741 14.975 17.3494 14.9997 17.2506 14.9997H15.9735C15.8747 14.9997 15.85 14.975 15.85 14.8677V8.71439C15.85 8.63206 15.8747 8.60736 15.9735 8.59912C16.7808 8.53412 17.6048 8.50032 18.3874 8.50032C20.1669 8.50032 20.7764 9.04394 20.7764 10.667C20.7764 11.8779 20.4553 12.4053 19.5572 12.6029L20.9577 14.8346C21.0236 14.9262 20.9824 14.9997 20.8589 14.9997Z" fill="currentColor" />
                          </g>
                          <path d="M19.9434 18.7498L14.7934 20.5404L11.7871 19.5279L12.6434 18.8936C12.8765 18.721 13.066 18.4964 13.1967 18.2376C13.3275 17.9787 13.3959 17.6929 13.3965 17.4029C13.3965 16.3811 12.5652 15.5498 11.5434 15.5498H9.43086C9.34023 15.5498 9.24648 15.5717 9.16211 15.6123L6.53398 16.8654C6.42738 16.9166 6.33739 16.9969 6.27437 17.0969C6.21135 17.197 6.17785 17.3128 6.17773 17.4311V22.9029C6.17767 23.0421 6.22405 23.1773 6.30953 23.2871C6.395 23.3969 6.51469 23.4751 6.64961 23.5092L14.4684 25.4811C14.5184 25.4936 14.5684 25.4998 14.6184 25.4998C14.7309 25.4998 14.8402 25.4717 14.934 25.4154L21.4371 21.6092C21.7865 21.3877 22.0379 21.0409 22.1396 20.6399C22.2413 20.2389 22.1856 19.8142 21.984 19.4529C21.791 19.1041 21.4757 18.8392 21.0988 18.7093C20.7219 18.5794 20.3102 18.5939 19.9434 18.7498Z" fill="currentColor" />
                          <defs>
                            <clipPath id="clip0_4204_1077">
                              <rect width="10.8333" height="10.8333" fill="white" transform="translate(13 6.33301)" />
                            </clipPath>
                          </defs>
                        </svg>
                        <div className="font-medium text-gray-900">Partial Payment</div>
                        <div className="text-xs text-gray-500 mt-1">Pay custom amount</div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        {selectedBrand.currency === 'ZAR' ? 'R' : getCurrencySymbol(selectedBrand.currency)}
                      </span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        disabled={!isPartialPayment}
                        min="0"
                        max={selectedBrand.remainingAmount}
                        step="0.01"
                        className={`w-full pl-10 pr-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isPartialPayment ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                        placeholder="Enter amount"
                      />
                    </div>
                    {isPartialPayment && (
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: {formatCurrency(selectedBrand.remainingAmount, selectedBrand.currency)}
                      </p>
                    )}
                  </div>

                  {/* Remaining Amount */}
                  {isPartialPayment && paymentAmount && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-900">
                          Remaining Balance:
                        </span>
                        <span className="font-bold text-blue-900">
                          {formatCurrency(calculateRemaining(), selectedBrand.currency)}
                        </span>
                      </div>
                      {calculateRemaining() > 0 && (
                        <p className="text-xs text-blue-700 mt-1">
                          A new settlement will be created for the remaining amount
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Add payment notes or reference..."
                    />
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This action will process the payment and cannot be undone.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!processMessage && (
              <div className="flex gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
                <button
                  onClick={closeModal}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessSettlement}
                  disabled={processing || !paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Payment'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAnalyticsTable;