import React from 'react';
import { Printer, Gift, Edit, Calendar, DollarSign } from 'lucide-react';
import { useSelector } from 'react-redux';

const PrintForm = () => {
  const data = useSelector((state) => state.giftFlowReducer);
  const { selectedBrand, selectedAmount, selectedSubCategory, personalMessage } = data;

  return (
    <div className="grid grid-cols-2 gap-8 pl-8 pr-12 py-4">
      {/* Left Section - Information */}
      <div className="flex flex-col justify-center gap-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
          <Printer className="w-10 h-10 text-purple-600" />
        </div>
        
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            Print-at-Home Gift Card
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            We'll generate a beautiful PDF with your gift card design, personal message, and voucher code. Perfect for hand delivery or surprise presentations!
          </p>
        </div>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Gift className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Instant PDF Download</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Print Anytime</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Edit className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Personalized Message</span>
          </div>
        </div>
      </div>

      {/* Right Section - Gift Card Preview */}
      <div className="flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          {/* Card Header with Occasion Image */}
          <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
            {selectedSubCategory?.image ? (
              <img 
                src={selectedSubCategory.image} 
                alt={selectedSubCategory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">{selectedSubCategory?.emoji || '🎁'}</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-gray-800">
                {selectedSubCategory?.name || 'Gift Card'}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            {/* Brand Section */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {selectedBrand?.logo ? (
                  <img src={selectedBrand.logo} alt={selectedBrand.brandName} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-xl font-bold text-gray-600">
                    {selectedBrand?.brandName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{selectedBrand?.brandName}</h4>
                <p className="text-sm text-gray-500">{selectedBrand?.categoryName}</p>
              </div>
            </div>

            {/* Amount Section */}
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-2xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
                <span className="text-4xl font-bold text-gray-900">
                  {selectedAmount?.value}
                </span>
                <span className="text-lg font-medium text-gray-600">
                  {selectedAmount?.currency}
                </span>
              </div>
            </div>

            {/* Personal Message */}
            {personalMessage && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Personal Message</p>
                <p className="text-sm text-gray-700 italic">"{personalMessage}"</p>
              </div>
            )}

            {/* Voucher Code Placeholder */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Voucher Code</p>
              <div className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                XXXX-XXXX-XXXX
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 px-6 text-center">
            <p className="text-xs text-gray-500">
              {selectedBrand?.vouchers?.[0]?.expiresAt ? (
                <>Valid until {new Date(selectedBrand.vouchers[0].expiresAt).toLocaleDateString()}</>
              ) : selectedBrand?.vouchers?.[0]?.expiryValue ? (
                <>Valid for {selectedBrand.vouchers[0].expiryValue} days from activation</>
              ) : (
                <>No expiration date</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintForm;