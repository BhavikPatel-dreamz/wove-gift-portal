import React from "react";

const ThankYouScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="rounded-2xl p-12 text-center">
        <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">
          Thanks for your purchase!
        </h1>
        <p className="text-[#4A4A4A] font-medium text-[16px] mb-6">
          Create your account now to track your order and access exclusive rewards.
        </p>
        <div className="w-full flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)] text-white rounded-full font-semibold hover:shadow-lg transition-all flex gap-3 items-center cursor-pointer"
          >
            Send Another Gift
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
              <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouScreen;