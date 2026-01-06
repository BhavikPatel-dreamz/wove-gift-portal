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
      <h1 className="text-center mt-8 text-[40px] font-bold text-black fontPoppins">
        Gifting, made{' '}
        <span className="text-orange-500">
          joyful.
        </span>
      </h1>
      <p className="mt-3 text-center text-[16px] sm:text-base text-[#4A4A4A] max-w-xl mx-auto">
        Wove connects you to the brands people love—so you can send meaningful, instant gifts that feel personal, wherever they are.
      </p>
    </div>
  );
};

export default GiftBanner;