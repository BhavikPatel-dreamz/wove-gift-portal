import React from "react";
import { Printer, Gift, Edit, Calendar, DollarSign } from "lucide-react";
import { useSelector } from "react-redux";
import { currencyList } from "../../brandsPartner/currency";

const PrintForm = () => {
  const data = useSelector((state) => state.giftFlowReducer);
  const { selectedBrand, selectedAmount, selectedSubCategory, personalMessage } = data;

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "R";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 sm:px-6 lg:px-12 py-6">

      {/* Left Section */}
      <div className="flex flex-col justify-center gap-6 max-w-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-purple-100 to-pink-100 rounded-2xl">
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
          <div className="relative h-40 sm:h-48 bg-linear-to-br from-purple-500 to-pink-500">
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
              <div className="w-full bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl py-5 flex items-center justify-center gap-2">
                <span className="text-base sm:text-lg text-gray-600">
                  {getCurrencySymbol(selectedAmount?.currency)}
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {selectedAmount?.value}
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
                  {personalMessage}
                </p>
              </div>
            )}

            {/* Voucher */}
            <div className="bg-linear-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                Voucher Code
              </p>
              <div className="text-gray-900 font-mono text-base sm:text-lg font-bold tracking-wider">
                XXXX-XXXX-XXXX
              </div>
            </div>
          </div>

          {/* Redemption Instructions */}
          <div className="bg-[#FFFBEF] rounded-2xl p-5 mx-5 sm:mx-6 mb-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3">
              How to use your gift card:
            </h4>

            <ol className="space-y-2 text-xs sm:text-sm text-gray-700 list-decimal pl-4">
              <li>Visit the brand website below</li>
              <li>Enter your voucher code at checkout</li>
              <li>
                Enjoy your {selectedBrand?.brandName || "gift card"} experience!
              </li>
            </ol>

            <div className="flex items-start gap-1 mt-4 pt-3 border-t border-[#E7DDC7]">
              <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                Brand Website:
              </p>

              <a
                href={
                  selectedBrand?.website?.startsWith("http")
                    ? selectedBrand.website
                    : `https://${selectedBrand?.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-gray-900  break-all hover:text-black transition-colors flex-1 min-w-0"
              >
                {selectedBrand?.website}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-5 text-center border-t border-gray-200">
            <p className="text-[11px] text-gray-500 mb-3">
              {selectedAmount?.expiresAt
                ? `Valid until ${new Date(
                  selectedAmount.expiresAt
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
                : "No expiration date"}
            </p>

            <p className="text-[11px] text-gray-500 mb-2">
              This gift card was sent to you via WoveGifts, powered by MyPerks.
            </p>

            {selectedBrand?.contact && (
              <p className="text-[11px] text-gray-500 mb-2">
                Need help? Contact us at {selectedBrand.contact}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 flex-wrap">
              <span>Terms & Conditions</span>
              <span>|</span>
              <span>Privacy Policy</span>
            </div>

            <p className="text-[10px] text-gray-400">
              © 2026 WoveGifts (a MyPerks company)
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