import React from "react";
import { Shield } from "lucide-react";

const PaymentMethodSelector = ({ selectedTab, onTabChange, isBulkMode }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M30.6673 9.33334V26.6667H5.33398V24H28.0007V9.33334H30.6673ZM25.334 21.3333H1.33398V5.33334H25.334V21.3333ZM17.334 13.3333C17.334 11.12 15.5473 9.33334 13.334 9.33334C11.1207 9.33334 9.33398 11.12 9.33398 13.3333C9.33398 15.5467 11.1207 17.3333 13.334 17.3333C15.5473 17.3333 17.334 15.5467 17.334 13.3333Z" fill="url(#paint0_linear_2267_1209)" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Choose Your Payment Method</h2>
          <p className="text-sm text-gray-600">Select how you'd like to complete this transaction</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 p-3 bg-green-50 mb-6 w-fit m-auto rounded-[50px]">
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-sm font-semibold text-green-600">
          Your payment is 100% secure and encrypted
        </span>
      </div>

      <div className="flex gap-3 mb-3">
        <button
          onClick={() => onTabChange('payfast')}
          className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${
            selectedTab === 'payfast' ? 'border-[#2563EB] bg-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {/* PayFast Icon */}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">PayFast</p>
            <p className="text-xs text-gray-600">Trusted South African...</p>
          </div>
        </button>

        <button
          onClick={() => onTabChange('card')}
          className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${
            selectedTab === 'card' ? 'border-[#9333EA] bg-pink-100' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            {/* Card Icon */}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">Card</p>
            <p className="text-xs text-gray-600">Visa, Mastercard</p>
          </div>
        </button>
      </div>

      {!isBulkMode && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => onTabChange('discovery')}
            className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${
              selectedTab === 'discovery' ? 'border-[#20A752] bg-[#20A75214]' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="w-10 h-10 bg-[#20A75214] rounded-lg flex items-center justify-center">
              {/* Discovery Icon */}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Discovery Miles</p>
              <p className="text-xs text-gray-600">Pay with your Discove...</p>
            </div>
          </button>

          <button
            onClick={() => onTabChange('ebucks')}
            className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${
              selectedTab === 'ebucks' ? 'border-[#EA580C] bg-[#EA580C14]' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="w-10 h-10 bg-[#EA580C14] rounded-lg flex items-center justify-center">
              {/* eBucks Icon */}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">eBucks (FNB)</p>
              <p className="text-xs text-gray-600">Pay with your FNB eB...</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;