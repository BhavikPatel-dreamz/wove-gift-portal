import React from "react";

const WhyWoveExists = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
        {/* Left content */}
        <div className="flex-1 max-w-xl">
          <h2 className="font-bold text-3xl md:text-4xl mb-4 leading-tight">
            Why Wove exists
          </h2>
          <p className="text-gray-700 text-base md:text-lg mb-8 leading-relaxed">
            Gifting should feel joyful, not stressful. We built Wove to turn "What do I buy?" into "That was easy." With access to trusted brands and instant delivery, you choose the vibe fashion, food, wellness, travel and we deliver a beautiful gift card that always fits.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-medium rounded-full px-6 py-3 hover:brightness-110 transition ">
              Start Gifting <span className='pl-2'>▸</span>
            </button>
            <button className="border border-pink-500 text-pink-500 font-medium rounded-full px-6 py-3 hover:bg-pink-50 transition">
              Explore Bulk Gifting <span className='pl-2'>▸</span>
            </button>
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
