import React from 'react';

const GiftBanner = () => {
  return (
    <div
      className="p-10 py-20"
      style={{
        borderRadius: '0 0 50px 50px',
        background: 'linear-gradient(126deg, #FBDCE3 31.7%, #FDE6DB 87.04%)',
      }}
    >
      <h1 className="text-center text-2xl md:text-3xl font-extrabold text-black">
        Gifting, made{' '}
        <span className="text-orange-500">
          joyful.
        </span>
      </h1>
      <p className="mt-7 text-center text-sm sm:text-base text-black max-w-xl mx-auto">
        Wove connects you to the brands people love—so you can send meaningful, instant gifts that feel personal, wherever they are.
      </p>
    </div>
  );
};

export default GiftBanner;