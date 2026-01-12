"use client";

import React, { useMemo } from "react";

const SettlementBanking = ({ banking, error }) => {
  const BankField = useMemo(() => ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-[#64748B] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#4A4A4A]">{value || 'N/A'}</p>
    </div>
  ), []);

  const VerificationBadge = useMemo(() => ({ isVerified }) => (
    <p
      className={`inline-flex items-center gap-1.5 rounded-[9px] px-3 py-1 text-xs font-semibold
        ${isVerified
          ? 'bg-green-50 text-green-600'
          : 'bg-[#F43F5E1A] text-[#F43F5E] border-2 border-[#F43F5E33]'
        }`}
    >
      {isVerified ? (
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 102 0 1 1 0 00-2 0zm2-7a1 1 0 10-2 0v4a1 1 0 102 0V6z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {isVerified ? 'Verified' : 'Not Verified'}
    </p>
  ), []);

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
            <p className="mt-4 text-base font-medium text-red-800">Failed to load banking details</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!banking) {
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
          <p className="mt-4 text-base font-medium text-yellow-800">No banking details found</p>
          <p className="mt-1 text-sm text-yellow-600">Banking information is not available for this settlement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bank Account Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-base font-semibold text-[#4A4A4A] mb-6">Bank Account Details</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BankField 
            label="Account Holder" 
            value={banking.accountHolder} 
          />
          <BankField 
            label="Account Number" 
            value={banking.accountNumber} 
          />
          <BankField 
            label="Bank name" 
            value={banking.bankName} 
          />
          <BankField 
            label="Branch Code" 
            value={banking.branchCode} 
          />
          <BankField 
            label="Country" 
            value={banking.country} 
          />
          <BankField 
            label="Payout Method" 
            value={banking.payoutMethod === 'EFT' ? 'ETF' : banking.payoutMethod} 
          />
        </div>
      </div>

      {/* Settlement Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-base font-semibold text-[#4A4A4A] mb-6">Settlement Configuration</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BankField 
            label="Settlement Frequency" 
            value={banking.settlementFrequency} 
          />
          <BankField 
            label="Settlement Date" 
            value={banking.dayOfMonth} 
          />
          
          <div>
            <p className="text-sm font-medium text-[#64748B] mb-2">Account Verification</p>
            <VerificationBadge isVerified={banking.accountVerification} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementBanking;