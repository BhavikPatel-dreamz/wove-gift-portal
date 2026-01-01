import React from "react";
import GiftSmallIcon from "../../../../icons/GiftSmallIcon";

const GiftDetailsCard = ({ 
  selectedBrand, 
  selectedAmount, 
  selectedSubCategory,
  selectedOccasionName,
  personalMessage,
  deliveryMethod,
  deliveryDetails,
  formatAmount,
  isBulkMode,
  quantity,
  companyInfo
}) => {
  const getDeliveryIcon = () => {
    return deliveryMethod === 'email' ? '📧' : deliveryMethod === 'whatsapp' ? '💬' : '🖨️';
  };

  const getDeliveryText = () => {
    return deliveryMethod === 'email' ? 'Email' : deliveryMethod === 'whatsapp' ? 'WhatsApp' : 'Print';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#1A1A1A1A]">
        <div className="w-10 h-10 bg-[linear-gradient(180deg,#FEF8F6_0%,#FDF7F8_100%)] rounded-lg flex items-center justify-center">
          {/* Gift Icon SVG */}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Your Beautiful Gift</h2>
          <p className="text-sm text-gray-600">Ready to make someone smile</p>
        </div>
      </div>

      {/* Brand Display */}
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0">
            {selectedBrand?.logo ? (
              <img src={selectedBrand.logo} alt={selectedBrand.brandName} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{(selectedBrand?.brandName || 'B').substring(0, 1).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[16px] text-[#1A1A1A]">{selectedBrand?.brandName || 'Gift Card'}</h3>
            <div className="flex items-center gap-2">
              <GiftSmallIcon />
              <p className="font-semibold text-[14px] text-[#1A1A1A] mt-1">{formatAmount(selectedAmount)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0">
            {selectedSubCategory?.image ? (
              <img src={selectedSubCategory?.image} alt={selectedSubCategory?.name} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{(selectedSubCategory?.name || 'B').substring(0, 1).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{selectedSubCategory?.name || 'Gift Card'}</h3>
            <p className="text-sm text-gray-600">{selectedOccasionName || 'Gift'}</p>
          </div>
        </div>
      </div>

      {/* Personal Message */}
      <div className="border-b border-[#1A1A1A1A] mb-5">
        {personalMessage && (
          <div className="p-4 bg-gray-50 rounded-xl mb-4 border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-800 italic leading-relaxed">"{personalMessage}"</p>
          </div>
        )}
      </div>

      {/* Delivery Info */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-[#39AE41] rounded-lg flex items-center justify-center">
          {/* WhatsApp Icon SVG */}
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Delivering via {getDeliveryText()}</p>
          <p className="text-xs text-green-700">
            {deliveryMethod === 'email'
              ? `to ${deliveryDetails?.recipientEmailAddress || 'Friend'}`
              : deliveryMethod === 'whatsapp'
                ? 'to Friend'
                : 'Print at home'}
          </p>
        </div>
      </div>

      {/* Promocode */}
      <div className="mt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Promocode"
              className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 text-sm font-bold rounded-lg hover:bg-pink-50 transition-colors bg-linear-to-tr from-[#ED457D] to-[#FA8F42] bg-clip-text text-transparent cursor-pointer">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftDetailsCard;