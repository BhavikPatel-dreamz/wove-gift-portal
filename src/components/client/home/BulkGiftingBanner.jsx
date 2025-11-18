import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

const BulkGiftingBanner = () => {
    return (
        <div className="w-full max-w-[1440px] mx-auto py-8 md:py-20 px-4">
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
                        <button className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2 mb-4 md:mb-6 hover:scale-105 mx-auto md:mx-0 text-sm md:text-base">
                            Explore Bulk Gifting
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="flex items-center justify-center md:justify-start gap-2 text-[#4A4A4A] text-sm md:text-base">
                            <div className="bg-emerald-500 rounded-full p-1 flex items-center justify-center">
                                <Check className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium">Trusted by 500+ Companies</span>
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