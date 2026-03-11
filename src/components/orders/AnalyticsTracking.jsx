"use client";
import React, { useTransition } from 'react';
import { TrendingUp, DollarSign, Calendar, Building2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useMemo } from 'react';

const AnalyticsTracking = ({
  initialBrandRedemptions = [],
  initialSettlements = [],
  initialPeriod = 'lastMonth',
  initialBrands = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const brandRedemptions = initialBrandRedemptions;
  const settlements = initialSettlements;

  // Get current filter values from URL
  const currentBrandId = searchParams.get('brandId') || '';
  const currentDateFrom = searchParams.get('dateFrom') || '';
  const currentDateTo = searchParams.get('dateTo') || '';
  const currentPeriod = searchParams.get('period') || initialPeriod;
  const currentMonth = searchParams.get('filterMonth') || null;

  // Handle filter updates - use startTransition only when both dates are set or cleared
  const handleUpdateParams = (updates) => {
    const params = new URLSearchParams(searchParams);

    // Apply all updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Check if this is a partial date update
    const updatingDateFrom = 'dateFrom' in updates;
    const updatingDateTo = 'dateTo' in updates;
    const isPartialDateUpdate = (updatingDateFrom && !updatingDateTo && !params.get('dateTo')) ||
      (updatingDateTo && !updatingDateFrom && !params.get('dateFrom'));

    // Only use transition if we have both dates or neither
    if (!isPartialDateUpdate) {
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    } else {
      // For partial updates, just update without transition
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleBrandFilter = (value) => {
    handleUpdateParams({ brandId: value });
  };

  const handlePeriodFilter = (value) => {
    // When period changes, clear the month filter
    handleUpdateParams({ period: value, filterMonth: '' });
  };

  const handleDateFromFilter = (value) => {
    const params = new URLSearchParams(searchParams);
    const currentDateTo = params.get('dateTo');

    // If we have both dates or neither, trigger transition
    if (value && currentDateTo) {
      handleUpdateParams({ dateFrom: value });
    } else if (!value && !currentDateTo) {
      handleUpdateParams({ dateFrom: value });
    } else {
      // Just update URL without transition for partial date
      params.set('dateFrom', value);
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleDateToFilter = (value) => {
    const params = new URLSearchParams(searchParams);
    const currentDateFrom = params.get('dateFrom');

    // If we have both dates or neither, trigger transition
    if (value && currentDateFrom) {
      handleUpdateParams({ dateTo: value });
    } else if (!value && !currentDateFrom) {
      handleUpdateParams({ dateTo: value });
    } else {
      // Just update URL without transition for partial date
      params.set('dateTo', value);
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleMonthChange = (value) => {
    // When month changes, clear period filter
    handleUpdateParams({ filterMonth: value, period: '' });
  };

  // Prepare brand options
  const brandOptions = initialBrands.map(brand => ({
    value: brand.id,
    label: brand.brandName
  }));

  // Period options
  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  // Generate month options (last 24 months)
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

  // Get current month label for display
  const currentMonthLabel = currentMonth
    ? monthOptions.find(m => m.value === currentMonth)?.label || 'Select Month'
    : 'Select Month';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-350 mx-auto px-6 py-8 pt-0">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">
            Analytics & Performance Tracking
          </h1>
          {/* <div className="h-px bg-gray-300 mt-6"></div> */}
        </div>



        {/* Loading Overlay */}
        {isPending && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading analytics...</p>
            </div>
          </div>
        )}

        {/* Main Content - White Card */}
        <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          <div className=" mb-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                Redemption Rate by Brand
              </h2>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Brand Filter */}
                <div className="w-[180px]">
                  <CustomDropdown
                    options={brandOptions}
                    placeholder="All Brands"
                    value={currentBrandId}
                    onChange={handleBrandFilter}
                    className="w-full"
                  />
                </div>

                {/* Period Filter */}
                {/* <div className="w-[160px]">
                  <CustomDropdown
                    options={periodOptions}
                    placeholder="Select Period"
                    value={currentPeriod}
                    onChange={handlePeriodFilter}
                    className="w-full"
                  />
                </div> */}

                {/* Month Filter */}
                <div className="w-[180px]">
                  <CustomDropdown
                    value={currentMonthLabel}
                    onChange={handleMonthChange}
                    options={monthOptions}
                    placeholder="Select Month"
                    className="min-w-30"
                  />
                </div>

                {/* Clear Filters */}
                {(currentBrandId ||
                  currentDateFrom ||
                  currentDateTo ||
                  currentMonth ||
                  (currentPeriod && currentPeriod !== "lastMonth")) && (
                    <button
                      onClick={() =>
                        handleUpdateParams({
                          brandId: "",
                          dateFrom: "",
                          dateTo: "",
                          period: "lastMonth",
                          filterMonth: "",
                        })
                      }
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  )}

              </div>
            </div>
          </div>
          {/* Redemption Rate by Brand */}
          <div className="mb-10">
            {brandRedemptions.length > 0 ? (
              <>
                {/* First Row - 4 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brandRedemptions.slice(0, 4).map((brand, index) => (
                    <div
                      key={index}
                      className={`${brand.bgColor} rounded-xl p-4`}
                    >
                      {/* Brand Info Row */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Logo */}
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="w-12 h-12 rounded-lg" />
                          ) : (
                            <span className="text-xl">🎁</span>
                          )}
                        </div>
                        {/* Brand Name */}
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {brand.name}
                        </h3>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between">
                        {/* Percentage */}
                        <span className="text-xl font-semibold text-gray-900">
                          {brand.redemptionRate}%
                        </span>
                        {/* Badge */}
                        <span className="px-3 py-1 bg-white text-gray-600 rounded-full text-xs font-normal border border-gray-300">
                          {brand.redeemed}/{brand.total} Redeemed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Second Row - 3 columns (if more than 4 brands) */}
                {brandRedemptions.length > 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {brandRedemptions.slice(4, 8).map((brand, index) => (
                      <div
                        key={index + 4}
                        className={`${brand.bgColor} rounded-xl p-4`}
                      >
                        {/* Brand Info Row */}
                        <div className="flex items-center gap-3 mb-3">

                          {/* Logo */}
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden p-1">
                            {brand.logo ? (
                              brand.logo.startsWith("http") ? (
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xl">{brand.logo}</span>
                              )
                            ) : (
                              <span className="text-xl">🎁</span>
                            )}
                          </div>

                          {/* Brand Name */}
                          <h3 className="text-[14px] font-semibold text-[#1A1A1A] leading-[14px]">
                            {brand.name}
                          </h3>

                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between">
                          {/* Percentage */}
                          <span className="text-[14px] font-semibold text-[#4A4A4A] leading-[14px]">
                            {brand.redemptionRate}%
                          </span>
                          {/* Badge */}
                          <span className="px-3 py-1 bg-white text-[#64748B] rounded-full text-[12px] font-medium leading-[20px] border border-gray-300 font-inter">
                            {brand.redeemed}/{brand.total} Redeemed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No redemption data available</p>
                <p className="text-gray-500 text-sm mt-1">Data will appear once orders are redeemed</p>
              </div>
            )}
          </div>

          {/* ── Settlement Overview ── */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Settlement Overview
            </h2>

            {settlements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {settlements.map((settlement, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-sm">{settlement.brand}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-green-600">
                          {settlement.currency === 'ZAR' ? 'R' : settlement.currency === 'USD' ? '$' : '₹'}
                          {settlement.amount?.toLocaleString()}
                        </span>
                        <span className={`px-3 py-1 rounded-md text-xs font-semibold ${settlement.status === 'Paid'
                          ? 'bg-green-50 text-green-600'
                          : settlement.status === 'Partial'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-orange-50 text-orange-500'
                          }`}>
                          {settlement.status}
                        </span>
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No settlement data available</p>
                <p className="text-gray-500 text-sm mt-1">Settlements will appear once orders are processed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTracking;