import React from "react";
import { Printer, Gift, Edit, Calendar, DollarSign } from "lucide-react";
import { useSelector } from "react-redux";

const PrintForm = () => {
  const data = useSelector((state) => state.giftFlowReducer);
  const { selectedBrand, selectedAmount, selectedSubCategory, personalMessage } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 sm:px-6 lg:px-12 py-6">

      {/* Left Section */}
      <div className="flex flex-col justify-center gap-6 max-w-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
          <Printer className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Print-at-Home Gift Card
          </h3>
          <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
            We'll generate a beautiful PDF with your gift card design, personal message,
            and voucher code. Perfect for hand delivery or surprise presentations!
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Feature icon={<Gift />} text="Instant PDF Download" />
          <Feature icon={<Calendar />} text="Print Anytime" />
          <Feature icon={<Edit />} text="Personalized Message" />
        </div>
      </div>

      {/* Right Section – Preview */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform lg:hover:scale-105 transition-transform duration-300">

          {/* Header */}
          <div className="relative h-40 sm:h-48 bg-gradient-to-br from-purple-500 to-pink-500">
            {selectedSubCategory?.image ? (
              <img
                src={selectedSubCategory.image}
                alt={selectedSubCategory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl sm:text-8xl">
                  {selectedSubCategory?.emoji || "🎁"}
                </span>
              </div>
            )}

            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full">
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                {selectedSubCategory?.name || "Gift Card"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-4">

            {/* Brand */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {selectedBrand?.logo ? (
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.brandName}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-600">
                    {selectedBrand?.brandName?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  {selectedBrand?.brandName}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  {selectedBrand?.categoryName}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center py-3">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-3 rounded-2xl">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {selectedAmount?.value}
                </span>
                <span className="text-base sm:text-lg text-gray-600">
                  {selectedAmount?.currency}
                </span>
              </div>
            </div>

            {/* Message */}
            {personalMessage && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Personal Message
                </p>
                <p className="text-sm text-gray-700 italic">
                  “{personalMessage}”
                </p>
              </div>
            )}

            {/* Voucher */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Voucher Code
              </p>
              <div className="font-mono text-base sm:text-lg font-bold tracking-wider">
                XXXX-XXXX-XXXX
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-xs text-gray-500">
              {selectedBrand?.vouchers?.[0]?.expiresAt
                ? `Valid until ${new Date(
                    selectedBrand.vouchers[0].expiresAt
                  ).toLocaleDateString()}`
                : selectedBrand?.vouchers?.[0]?.expiryValue
                ? `Valid for ${selectedBrand.vouchers[0].expiryValue} days`
                : "No expiration date"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-gray-700">
    {React.cloneElement(icon, { className: "w-5 h-5 text-purple-600" })}
    <span className="font-medium text-sm sm:text-base">{text}</span>
  </div>
);

export default PrintForm;
