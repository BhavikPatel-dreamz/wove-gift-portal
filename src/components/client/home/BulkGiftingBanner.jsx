"use client"
import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { clearCsvFileData, resetFlow, setCurrentStep } from '@/redux/giftFlowSlice';

const BulkGiftingBanner = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch(resetFlow());
        dispatch(setCurrentStep(1));
        dispatch(clearCsvFileData());
    };


    return (
        <div className="w-full max-w-360 mx-auto py-8 md:py-20 px-4">
            <div className="bg-[#FFE6D4] rounded-2xl md:rounded-3xl p-6 md:p-12 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Content - Mobile: Bottom, Desktop: Left */}
                    <div className="z-10 max-w-xl order-2 md:order-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-[40px] font-semibold text-[#1A1A1A] mb-3 md:mb-4 leading-tight">
                            Need to send lots of gifts?
                        </h1>
                        <p className="text-[#4A4A4A] text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">
                            Buy in bulk for your team or clients. Perfect for employee appreciation, client rewards, and corporate gifting campaigns
                        </p>

                        <Link
                            href="/gift?mode=bulk"
                            onClick={handleClick}
                            className="bg-linear-to-r cursor-pointer max-w-fit from-pink-500 to-orange-400 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2 mb-4 md:mb-6 hover:scale-105 mx-auto md:mx-0 text-sm md:text-base"
                        >
                            Explore Bulk Gifting
                            <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
                                <path
                                    d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                                    fill="white"
                                />
                            </svg>
                        </Link>

                        <div className="flex items-center justify-center md:justify-start gap-2 text-[#4A4A4A] text-sm md:text-base">
                            <div className="bg-emerald-500 rounded-full p-1 flex items-center justify-center">
                                <Check className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium text-[#4A4A4A] text-[16px] line-height-[32px]">Trusted by 500+ Companies</span>
                        </div>
                    </div>
                    <div className="relative z-10 order-1 md:order-2 w-full md:w-auto flex justify-center">
                        <div className="relative w-64 h-48 md:w-full md:h-72">
                            {/* Gift boxes illustration */}
                            <img
                                src="/giftGroup.svg"
                                alt="Example Image"
                                width={500}
                                height={300}
                                className="rounded-lg object-cover"
                            />

                            {/* Small orange gift boxes */}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default BulkGiftingBanner;