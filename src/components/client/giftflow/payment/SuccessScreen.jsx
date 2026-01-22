import React from "react";

const SuccessScreen = ({ 
  order, 
  selectedBrand, 
  quantity, 
  selectedAmount, 
  isBulkMode, 
  onNext,
  deliveryDetails
}) => {

  return (
    <div className="min-h-screen px-4 py-30 md:px-6 md:py-30">
      <div className="max-w-[1440px] flex items-center justify-center m-auto mb-6">
        <div className="max-w-[800px] m-auto rounded-2xl p-8 text-center">
          {isBulkMode ? (
            <div>
              <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">
                Your bulk order is complete!
              </h1>
              <p className="font-normal text-[16px] text-[#4A4A4A] mb-6">
                We've emailed you a CSV file with all voucher codes to Your Email Address
              </p>
            </div>
          ) : (
            <div className="mt-25">
              <img src={"/Success.gif"} alt={"Success"} className="w-26 h-26 m-auto mb-4" />
              <h1 className="text-[40px] font-bold text-[#1A1A1A] mb-4 fontPoppins">
                Gift Sent Successfully
              </h1>
              <p className="font-normal text-[16px] text-[#4A4A4A] mb-6">
                {`Your beautiful ${selectedBrand.brandName} gift card is on its way to Friend!`}
              </p>
            </div>
          )}

          {isBulkMode && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Order details</h2>
              <div className="h-px bg-gray-200 mb-6"></div>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Order ID:</span>
                  <span className="font-semibold text-gray-900">{order.bulkOrderNumber}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Brand:</span>
                  <span className="font-semibold text-gray-900">{selectedBrand.brandName}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Vouchers Generated:</span>
                  <span className="font-semibold text-gray-900">{quantity}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Total Value:</span>
                  <span className="font-semibold text-gray-900">{order?.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex justify-center">
            <button
              onClick={onNext}
              className="w-fit cursor-pointer rounded-[50px] flex gap-3 items-center justify-center text-white py-3 px-6 font-semibold transition-all duration-200 bg-[linear-gradient(114.06deg,#ED457D_11.36%,#FA8F42_90.28%)]"
            >
              {isBulkMode ? 'Back To Home' : 'Send Another Gift'}
              {!isBulkMode && (
                <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
                  <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;