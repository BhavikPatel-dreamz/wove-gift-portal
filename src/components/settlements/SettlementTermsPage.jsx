'use client';

import React, { useState, useEffect } from 'react';
import { getSettlementTerms } from '../../lib/action/brandPartner';
import { useParams } from 'next/navigation';

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
        <div className="relative flex min-h-screen w-full flex-col bg-[#f6f7f8]">
            <main className="flex w-full flex-1 justify-center py-8 sm:py-12">
                <div className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Commission & Pricing Card */}
                        <div className="rounded-xl border border-gray-200 bg-white">
                            <h2 className="border-b border-gray-200 px-6 pb-3 pt-5 text-[22px] font-bold leading-tight tracking-[-0.015em] text-gray-900">
                                Commission & Pricing
                            </h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Commission Type
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.commissionType || 'Percentage'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Commission Value
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.commissionValue ? `${terms.commissionValue}%` : '5%'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Minimum Order Value
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        ₹ {terms?.minimumOrderValue || '50'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Maximum Discount
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        ₹ {terms?.maximumDiscount || '0'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contract Terms Card */}
                        <div className="rounded-xl border border-gray-200 bg-white">
                            <h2 className="border-b border-gray-200 px-6 pb-3 pt-5 text-[22px] font-bold leading-tight tracking-[-0.015em] text-gray-900">
                                Contract Terms
                            </h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Settlement Trigger
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.settlementTrigger || 'onPurchase'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        VAT Rate
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.vatRate ? `${terms.vatRate}%` : '15%'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Contract Start
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.contractStart
                                            ? new Date(terms.contractStart).toLocaleDateString('en-GB')
                                            : '29/11/2025'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Contract End
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.contractEnd
                                            ? new Date(terms.contractEnd).toLocaleDateString('en-GB')
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Breakage Policy Card */}
                        <div className="rounded-xl border border-gray-200 bg-white">
                            <h2 className="border-b border-gray-200 px-6 pb-3 pt-5 text-[22px] font-bold leading-tight tracking-[-0.015em] text-gray-900">
                                Breakage Policy
                            </h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Breakage Policy
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.breakagePolicy || 'Retain'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-normal leading-normal text-gray-500">
                                        Breakage Share
                                    </p>
                                    <p className="text-sm font-medium leading-normal text-gray-700">
                                        {terms?.breakageShare ? `${terms.breakageShare}%` : '0%'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SettlementTermsPage;