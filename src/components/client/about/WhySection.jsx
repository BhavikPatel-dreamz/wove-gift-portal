"use client"
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";
import { setCurrentStep, resetFlow } from "@/redux/giftFlowSlice";

const WhyWoveExists = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(resetFlow());
    dispatch(setCurrentStep(1));
  };

  return (
    <section className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-10 lg:gap-16 xl:gap-20">
        {/* Left content */}
        <div className="flex-1 w-full max-w-xl">
          <h2 className="text-[#1A1A1A] font-poppins text-2xl sm:text-3xl lg:text-[40px] font-semibold leading-tight sm:leading-11 mb-3 sm:mb-4">
            Why Wove exists
          </h2>
          <p className="text-[#4A4A4A] font-medium text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
            Gifting should feel joyful, not stressful. We built Wove to turn "What do I buy?" into "That was easy." With access to trusted brands and instant delivery, you choose the vibe fashion, food, wellness, travel and we deliver a beautiful gift card that always fits.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Link
              className="bg-linear-to-r from-pink-500 to-orange-400 text-white font-medium rounded-full px-6 py-3 hover:brightness-110 transition text-center sm:text-left"
              href="/gift"
              onClick={handleClick}
            >
              Start Gifting <span className='pl-2'>▸</span>
            </Link>

            <Link
              className="border border-pink-500 text-pink-500 font-medium rounded-full px-6 py-3 hover:bg-pink-50 transition text-center sm:text-left"
              href="/gift?mode=bulk"
              onClick={handleClick}
            >
              Explore Bulk Gifting <span className='pl-2'>▸</span>
            </Link>
          </div>
        </div>

        {/* Right image */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src="/why.png"
              alt="Person showing Wove Gifts mobile app"
              className="w-full h-auto block object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWoveExists;