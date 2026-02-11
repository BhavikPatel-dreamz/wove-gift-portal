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
                        className={`p-4 border-2 rounded-lg text-center transition-all ${!isPartialPayment
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <DollarSign className={`w-6 h-6 mx-auto mb-2 ${!isPartialPayment ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        <div className="font-medium text-gray-900">Full Payment</div>
                        <div className="text-xs text-gray-500 mt-1">Pay entire amount</div>
                      </button>
                      <button
                        onClick={() => handlePaymentTypeChange(true)}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${isPartialPayment
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <DollarSign className={`w-6 h-6 mx-auto mb-2 ${isPartialPayment ? 'text-blue-600' : 'text-gray-400'
                          }`} />
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