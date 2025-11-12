import React from "react";

const BulkGifting = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-14">
      {/* Main container with custom styles and fade effect */}
      <div className="relative">
        {/* Card with gradient border mask */}
        <div
          className="flex flex-col md:flex-row items-center p-8"
          style={{
            borderRadius: "30px",
            background: "linear-gradient(180deg, #FEF8F6 0%, #FDF7F8 100%)",
            position: "relative",
            isolation: "isolate",
          }}
        >
          {/* Gradient border that fades out at bottom */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "30px",
              padding: "1.5px",
              background: "linear-gradient(180deg, #ED457D 0%, #ED457D 60%, transparent 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            }}
          />
          
          {/* Left text section */}
          <div className="md:w-1/2 mb-8 md:mb-0 px-8 relative z-10">
            <h2 className="text-gray-900 font-extrabold text-2xl md:text-3xl leading-tight mb-4">
              Rewards at scale,<br />made simple.
            </h2>
            <p className="text-gray-700 text-sm md:text-base mb-6 max-w-md">
              Buy in bulk, receive CSV codes instantly, track and reconcile with ease. Perfect for staff rewards, client campaigns, and loyalty programs.
            </p>
            <button
              className="text-white bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 transition px-5 py-2 rounded-md font-semibold inline-flex items-center text-sm"
              aria-label="Explore Bulk Gifting"
            >
              Explore Bulk Gifting
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right image section */}
          <div className="flex justify-center md:justify-end select-none relative z-10">
            <img
              src="/gift.png"
              alt="Bulk gifting illustration"
              className="max-w-sm w-full h-auto"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Features / Benefits Section */}
      <div className="mt-8 flex flex-wrap justify-center md:justify-between max-w-4xl mx-auto text-gray-700 text-sm font-medium">
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

const icons = {
  payment: (
    <svg
      className="w-5 h-5 mr-2 text-green-700 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  voucher: (
    <svg
      className="w-5 h-5 mr-2 text-pink-600 flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-5-4H7L2 7zM7 10h10v4H7v-4z" />
    </svg>
  ),
  enterprise: (
    <svg
      className="w-5 h-5 mr-2 text-gray-800 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3 21v-8a2 2 0 012-2h1v10h2v-6h2v6h2v-10h1a2 2 0 012 2v8" />
      <path d="M7 10v-4h10v4" />
    </svg>
  ),
  support: (
    <svg
      className="w-5 h-5 mr-2 text-teal-600 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M18 18v-2a4 4 0 00-8 0v2" />
      <circle cx="12" cy="10" r="4" />
      <path d="M5 9v-1a7 7 0 0114 0v1" />
    </svg>
  ),
};

const Feature = ({ icon, text }) => (
  <div className="flex items-center whitespace-nowrap mb-4 md:mb-0">
    {icons[icon]}
    <span>{text}</span>
  </div>
);

const Separator = () => (
  <div className="hidden md:block mx-6 border-l border-gray-300 h-5 self-center" />
);

export default BulkGifting