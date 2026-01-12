"use client";

import React, { useMemo, useCallback } from "react";
import { currencyList } from "../brandsPartner/currency";

const SettlementTerms = ({ terms, error }) => {
  const getCurrencySymbol = useCallback((code) => {
    return currencyList.find((c) => c.code === code)?.symbol || "$";
  }, []);

  const TermField = useMemo(() => ({ label, value }) => (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-normal text-gray-900">{value || "-"}</p>
    </div>
  ), []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="rounded-lg bg-red-50 p-6">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-base font-medium text-red-800">
              Failed to load terms
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!terms) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="mt-4 text-base font-medium text-yellow-800">
            No terms found
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            Terms information is not available for this settlement.
          </p>
        </div>
      </div>
    );
  }

  const currSymbol = getCurrencySymbol(terms.currency);

  return (
    <div className="relative">
      <main className="flex w-full">
        <div className="flex w-full max-w-[1200px] flex-col gap-6">
          {/* Commission Pricing Card */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Commission Pricing
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-5">
              <TermField
                label="Commission Type"
                value={terms.commissionType}
              />
              <TermField
                label="Commission Value"
                value={terms.commissionValue ? `${terms.commissionValue}%` : null}
              />
              <TermField
                label="Minimum Order Value"
                value={
                  terms.minOrderValue
                    ? `${currSymbol} ${terms.minOrderValue}`
                    : null
                }
              />
              <TermField
                label="Minimum Discount"
                value={
                  terms.maxDiscount
                    ? `${currSymbol} ${terms.maxDiscount}`
                    : null
                }
              />
            </div>
          </div>

          {/* Contract Terms Card */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Contract Terms
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-5">
              <TermField
                label="Settlement Trigger"
                value={terms.settlementTrigger}
              />
              <TermField
                label="VAT Rate"
                value={terms.vatRate ? `${terms.vatRate}%` : null}
              />
              <TermField
                label="Contract Start"
                value={formatDate(terms.contractStart)}
              />
              <TermField
                label="Contract End"
                value={formatDate(terms.contractEnd)}
              />
            </div>
          </div>

          {/* Breakage Policy Card - Commented out as in original */}
          {/* <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Breakage Policy
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-5">
              <TermField
                label="Breakage Policy"
                value={terms.breakagePolicy}
              />
              <TermField
                label="Breakage Share"
                value={terms.breakageShare ? `${terms.breakageShare}%` : null}
              />
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default SettlementTerms;