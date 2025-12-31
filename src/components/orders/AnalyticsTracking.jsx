"use client";
import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

const AnalyticsTracking = ({
  initialBrandRedemptions = [],
  initialSettlements = [],
  initialPeriod = 'year'
}) => {
  const brandRedemptions = initialBrandRedemptions;
  const settlements = initialSettlements;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">
            Analytics & Performance Tracking
          </h1>
          <div className="h-px bg-gray-300 mt-6"></div>
        </div>

        {/* Main Content - White Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

          {/* Redemption Rate by Brand */}
          <div className="mb-10">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Redemption Rate by Brand
            </h2>

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
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
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
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                            {brand.logo ? (
                              brand.logo.startsWith('http') ? (
                                <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                              ) : (
                                <span className="text-xl">{brand.logo}</span>
                              )
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

          {/* Settlement Overview */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Settlement Overview
            </h2>

            {settlements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {settlements.map((settlement, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left Side */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {settlement.brand}
                        </h3>
                        <p className="text-xl font-semibold text-green-600">
                          ₹{settlement.amount.toLocaleString()}
                        </p>
                      </div>
                      {/* Status Badge */}
                      <span className="px-3 py-1 bg-white text-orange-600 rounded-lg text-xs font-semibold border border-orange-300">
                        {settlement.status}
                      </span>
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