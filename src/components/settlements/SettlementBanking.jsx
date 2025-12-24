import React, { useState, useEffect } from 'react';

const SettlementBanking = ({ banking }) => {


  const getPayoutMethodLabel = (method) => {
    const labels = {
      EFT: 'EFT',
      wire_transfer: 'Wire Transfer',
      paypal: 'PayPal',
      stripe: 'Stripe',
      manual: 'Manual'
    };
    return labels[method] || method;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly'
    };
    return labels[frequency] || frequency;
  };

  if (!banking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-yellow-600">warning</span>
          <p className="mt-2 text-sm font-medium text-yellow-800">No banking details found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="relative flex min-h-screen w-full flex-col">
        <div className="flex h-full grow flex-col">
          <div className="flex flex-1 justify-center p-4 sm:p-6 lg:p-8">
            <div className="flex w-full max-w-5xl flex-col gap-6">
              {/* Header */}
              {/* Content Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                {/* Left Column */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                  {/* Bank Account Details */}
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-gray-900">Bank Account Details</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-gray-200 p-5 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">Account Holder</p>
                        <p className="mt-1 font-medium text-gray-900">{banking.accountHolder}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="mt-1 font-medium text-gray-900">{banking.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="mt-1 font-medium text-gray-900">{banking.bankName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Branch Code</p>
                        <p className="mt-1 font-medium text-gray-900">{banking.branchCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Country</p>
                        <p className="mt-1 font-medium text-gray-900">{banking.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payout Method</p>
                        <p className="mt-1 font-medium text-gray-900">
                          {getPayoutMethodLabel(banking.payoutMethod)}
                        </p>
                      </div>
                      {banking.swiftCode && (
                        <div>
                          <p className="text-sm text-gray-500">SWIFT Code</p>
                          <p className="mt-1 font-medium text-gray-900">{banking.swiftCode}</p>
                        </div>
                      )}
                      {banking.remittanceEmail && (
                        <div>
                          <p className="text-sm text-gray-500">Remittance Email</p>
                          <p className="mt-1 font-medium text-gray-900">{banking.remittanceEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settlement Configuration */}
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-gray-900">Settlement Configuration</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-gray-200 p-5 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">Settlement Frequency</p>
                        <p className="mt-1 font-medium text-gray-900">
                          {getFrequencyLabel(banking.settlementFrequency)}
                        </p>
                      </div>
                      {banking.dayOfMonth && (
                        <div>
                          <p className="text-sm text-gray-500">Day of Month</p>
                          <p className="mt-1 font-medium text-gray-900">{banking.dayOfMonth}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Invoice Required</p>
                        <p className="mt-1 font-medium text-gray-900">
                          {banking.invoiceRequired ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                  {/* Account Verification */}
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-gray-900">Account Verification</h2>
                    </div>
                    <div className="flex flex-col gap-5 border-t border-gray-200 p-5">
                      {banking.accountVerification ? (
                        <div className="flex items-center gap-2 rounded-lg bg-green-100 p-3">
                          <span className="material-symbols-outlined text-green-600">check_circle</span>
                          <p className="text-sm font-bold text-green-800">Verified</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg bg-red-100 p-3">
                          <span className="material-symbols-outlined text-red-600">unpublished</span>
                          <p className="text-sm font-bold text-red-800">Not Verified</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementBanking;