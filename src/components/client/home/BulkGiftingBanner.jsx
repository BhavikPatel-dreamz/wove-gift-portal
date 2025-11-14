import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import RightArrow from '@/icons/RightArrow';

const BulkGiftingBanner = () => {
    return (
        <div className="w-full max-w-[1440px] mx-auto py-[80px] ">
            <div className="bg-[#FFE6D4] rounded-3xl p-12 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="z-10 max-w-xl">
                        <h1 className="text-[40px] font-semibold text-[#1A1A1A] fontPoppins mb-4">
                            Need to send lots of gifts?
                        </h1>
                        <p className="text-[#4A4A4A] text-lg mb-8 leading-relaxed">
                            Buy in bulk for your team or clients. Perfect for employee appreciation, client rewards, and corporate gifting campaigns
                        </p>
                        <button className="bg-linear-to-r from-pink-500 to-orange-500 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2 mb-6 hover:scale-105">
                            Explore Bulk Gifting
                            <RightArrow/>

                        </button>

                        <div className="flex items-center gap-2 text-[#4A4A4A]">
                            <div className="bg-emerald-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium">Trusted by 500+ Companies</span>
                        </div>
                    </div>

                    {/* Right Content - Gift Boxes */}
                    <div className="relative z-10">
                        <img
                            src="/giftGroup.svg"
                            alt="Example Image"
                            width={500}
                            height={300}
                            className="rounded-lg object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default BulkGiftingBanner