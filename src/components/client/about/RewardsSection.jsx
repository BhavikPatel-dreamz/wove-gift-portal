"use client";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";
import { setCurrentStep, resetFlow } from "@/redux/giftFlowSlice";

const BulkGifting = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(resetFlow());
    dispatch(setCurrentStep(1));
  };

  return (
    <div className="mx-auto mt-10 mb-14 px-4 sm:px-6 lg:px-0 max-w-7xl">
      {/* Card */}
      <div
        className="relative flex flex-col md:flex-row items-center
        rounded-[30px] bg-[#FFE6D4]
        px-6 sm:px-8 md:px-12
        py-10 md:py-14"
      >
        {/* Left content */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0 md:pr-10">
          <h2
            className="
              font-semibold fontPoppins text-[#1A1A1A]
              text-[28px]
              sm:text-[32px]
              md:text-[36px]
              lg:text-[40px]
              leading-tight mb-4
            "
          >
            Rewards at scale,
            <br className="hidden sm:block" />
            made simple.
          </h2>

          <p className="text-gray-700 text-sm sm:text-base mb-6 max-w-md">
            Buy in bulk, receive CSV codes instantly, track and reconcile with ease.
            Perfect for staff rewards, client campaigns, and loyalty programs.
          </p>

          <Link
            href="/gift?mode=bulk"
            onClick={handleClick}
            className="
              inline-flex items-center gap-2
              rounded-3xl px-5 py-3.5
              text-sm font-semibold text-white
              bg-gradient-to-r from-pink-500 to-orange-400
              hover:from-pink-600 hover:to-orange-500
              transition
            "
          >
            Explore Bulk Gifting
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
              <path
                d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z"
                fill="white"
              />
            </svg>
          </Link>
        </div>

        {/* Right image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img
            src="/gift.png"
            alt="Bulk gifting illustration"
            className="w-full max-w-sm md:max-w-full h-auto"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>

      {/* Features */}
      <div
        className="
          mt-8
          flex flex-wrap
          justify-center md:justify-between
          gap-y-4 gap-x-6
          text-gray-700
          text-sm sm:text-base
          font-medium
        "
      >
        <Feature icon="payment" text="Secure payments" />
        <Separator />
        <Feature icon="voucher" text="Brand-verified vouchers" />
        <Separator />
        <Feature icon="enterprise" text="Enterprise-ready" />
        <Separator />
        <Feature icon="support" text="Friendly support" />
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */

const icons = {
  payment: (
    <svg className="w-5 h-5 mr-2 text-green-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  voucher: (
    <svg className="w-5 h-5 mr-2 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-5-4H7L2 7zM7 10h10v4H7v-4z" />
    </svg>
  ),
  enterprise: (
    <svg className="w-5 h-5 mr-2 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M3 21v-8a2 2 0 012-2h1v10h2v-6h2v6h2v-10h1a2 2 0 012 2v8" />
      <path d="M7 10v-4h10v4" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M18 18v-2a4 4 0 00-8 0v2" />
      <circle cx="12" cy="10" r="4" />
      <path d="M5 9v-1a7 7 0 0114 0v1" />
    </svg>
  ),
};

const Feature = ({ icon, text }) => (
  <div className="flex items-center whitespace-nowrap">
    {icons[icon]}
    <span>{text}</span>
  </div>
);

const Separator = () => (
  <div className="hidden md:block border-l border-gray-300 h-5 self-center" />
);

export default BulkGifting;
