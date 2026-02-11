import React from 'react';

const GiftBanner = () => {
  return (
    <div
      className="p-10 py-25"
      style={{
        borderRadius: "0 0 50px 50px",
        background: "linear-gradient(151.97deg, rgba(251, 220, 227, 0.55) 17.3%, rgba(253, 230, 219, 0.55) 95.19%)",
      }}
      
    >
      <h1 className="text-center mt-4 sm:mt-6 lg:mt-8 text-2xl sm:text-3xl lg:text-[40px] font-bold text-black fontPoppins leading-tight">
        Gifting, made{' '}
        <span className="text-orange-500">
          joyful.
        </span>
      </h1>
      <p className="mt-3 sm:mt-4 text-center text-sm sm:text-base lg:text-[16px] text-[#4A4A4A] max-w-xl mx-auto px-4">
        Wove connects you to the brands people love—so you can send meaningful, instant gifts that feel personal, wherever they are.
      </p>
    </div>
  );
};

export default GiftBanner;