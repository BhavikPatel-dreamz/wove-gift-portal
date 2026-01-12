'use client';

import React, { useState, useEffect } from 'react';
import { getSettlementTerms } from '../../lib/action/brandPartner';
import { useParams } from 'next/navigation';
import { currencyList } from '../brandsPartner/currency';


const SettlementTermsPage = () => {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const settlementId = params.id;

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const result = await getSettlementTerms(settlementId);
        setTerms(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [settlementId]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f6f7f8]">
        <div className="text-gray-600">Loading terms...</div>
      </div>
    );
  }

     const getCurrencySymbol = (code) =>
         currencyList.find((c) => c.code === code)?.symbol || "$";

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f6f7f8]">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <main className="flex w-full">
        <div className="flex w-[1200px] flex-col gap-6">
          
          {/* Commission Pricing Card */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Commission Pricing
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Commission Type
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.commissionType || '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Commission Value
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.commissionValue ? `${terms.commissionValue}%` : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Minimum Order Value
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.minOrderValue ? `${getCurrencySymbol(terms.currency)} ${terms.minOrderValue}` : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Minimum Discount
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.maxDiscount ? `${getCurrencySymbol(terms.currency)} ${terms.maxDiscount}` : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Contract Terms Card */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Contract Terms
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Settlement Trigger
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.settlementTrigger || '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  VAT Rate
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.vatRate ? `${terms.vatRate}%` : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Contract Start
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.contractStart
                    ? new Date(terms.contractStart).toLocaleDateString('en-GB')
                    : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Contract End
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.contractEnd
                    ? new Date(terms.contractEnd).toLocaleDateString('en-GB')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Breakage Policy Card */}
          {/* <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Breakage Policy
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Breakage Policy
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.breakagePolicy || '-'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-gray-500">
                  Breakage Share
                </p>
                <p className="text-sm font-normal text-gray-900">
                  {terms?.breakageShare ? `${terms.breakageShare}%` : '-'}
                </p>
              </div>
            </div>
          </div> */}

        </div>
      </main>
    </div>
  );
};

export default SettlementTermsPage;