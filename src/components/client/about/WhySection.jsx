import Link from "next/link";
import React from "react";

const WhyWoveExists = () => {
  return (
    <section className="max-w-[1440px] mx-auto py-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
        {/* Left content */}
        <div className="flex-1 max-w-xl">
          <h2 className="font-bold text-[40px] md:text-4xl mb-4 leading-tight fontPoppins">
            Why Wove exists
          </h2>
          <p className="text-[#4A4A4A] font-medium text-base md:text-lg mb-8 leading-relaxed">
            Gifting should feel joyful, not stressful. We built Wove to turn "What do I buy?" into "That was easy." With access to trusted brands and instant delivery, you choose the vibe fashion, food, wellness, travel and we deliver a beautiful gift card that always fits.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-medium rounded-full px-6 py-3 hover:brightness-110 transition "
              href="/gift"
            >
              Start Gifting <span className='pl-2'>▸</span>
            </Link>

            <Link
             className="border border-pink-500 text-pink-500 font-medium rounded-full px-6 py-3 hover:bg-pink-50 transition"
              href="/gift?mode=bulk"
            >
                Explore Bulk Gifting <span className='pl-2'>▸</span>
            </Link>
          </div>
        </div>

        {/* Right image and quote */}
        <div className="flex-1 w-full max-w-md md:max-w-lg rounded-xl overflow-hidden shadow-lg relative">
          <img
            src="/why.png"
            alt="Person showing Wove Gifts mobile app"
            className="w-full h-auto block object-cover rounded-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyWoveExists;
