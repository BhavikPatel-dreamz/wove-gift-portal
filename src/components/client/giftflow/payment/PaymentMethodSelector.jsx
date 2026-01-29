import React from "react";
import { Shield } from "lucide-react";
import { useSelector } from "react-redux";
import { setIsPaymentConfirmed } from "../../../../redux/giftFlowSlice";
import { useDispatch } from "react-redux";

const PaymentMethodSelector = ({ selectedTab, onTabChange, isBulkMode }) => {
 const {
    isPaymentConfirmed,
  } = useSelector((state) => state.giftFlowReducer);
  const dispatch = useDispatch();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-11 h-11 flex items-center justify-center"
          style={{
            borderRadius: "12px",
            background: "linear-gradient(180deg, #FEF8F6 0%, #FDF7F8 100%)"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="22" viewBox="0 0 30 22" fill="none">
            <path d="M29.3333 4V21.3333H4V18.6667H26.6667V4H29.3333ZM24 16H0V0H24V16ZM16 8C16 5.78667 14.2133 4 12 4C9.78667 4 8 5.78667 8 8C8 10.2133 9.78667 12 12 12C14.2133 12 16 10.2133 16 8Z" fill="url(#paint0_linear_2965_1423)" />
            <defs>
              <linearGradient id="paint0_linear_2965_1423" x1="-2.03532e-07" y1="7.84906" x2="24.3216" y2="22.7801" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ED457D" />
                <stop offset="1" stopColor="#FA8F42" />
              </linearGradient>
            </defs>
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

      <div className="flex flex-col gap-3 mb-3">
        <button
          onClick={() => onTabChange('payfast')}
          className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${selectedTab === 'payfast' ? 'border-[#2563EB] bg-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M29.3321 16C29.3321 17.7511 28.9872 19.485 28.3171 21.1027C27.647 22.7205 26.6648 24.1904 25.4266 25.4286C24.1884 26.6668 22.7185 27.6489 21.1008 28.319C19.483 28.9891 17.7491 29.334 15.9981 29.334C14.247 29.334 12.5131 28.9891 10.8954 28.319C9.27761 27.6489 7.80768 26.6668 6.5695 25.4286C5.33132 24.1904 4.34915 22.7205 3.67905 21.1027C3.00896 19.485 2.66406 17.7511 2.66406 16C2.66406 12.4636 4.06889 9.07206 6.5695 6.57145C9.07011 4.07084 12.4617 2.66602 15.9981 2.66602C19.5345 2.66602 22.926 4.07084 25.4266 6.57145C27.9272 9.07206 29.3321 12.4636 29.3321 16Z" stroke="#2563EB" strokeWidth="2" />
              <path d="M21.3308 15.9998C21.3308 17.7505 21.1921 19.4852 20.9241 21.1025C20.6575 22.7198 20.2641 24.1892 19.7681 25.4278C19.2735 26.6665 18.6855 27.6478 18.0388 28.3185C17.3908 28.9878 16.6975 29.3332 15.9975 29.3332C15.2975 29.3332 14.6041 28.9878 13.9575 28.3185C13.3095 27.6478 12.7215 26.6652 12.2268 25.4278C11.7308 24.1892 11.3375 22.7212 11.0695 21.1025C10.796 19.4154 10.6604 17.7089 10.6641 15.9998C10.6641 14.2492 10.8015 12.5145 11.0695 10.8972C11.3375 9.27984 11.7308 7.8105 12.2268 6.57184C12.7215 5.33317 13.3095 4.35184 13.9561 3.68117C14.6041 3.01317 15.2975 2.6665 15.9975 2.6665C16.6975 2.6665 17.3908 3.01184 18.0375 3.68117C18.6855 4.35184 19.2735 5.3345 19.7681 6.57184C20.2641 7.8105 20.6575 9.2785 20.9241 10.8972C21.1935 12.5145 21.3308 14.2492 21.3308 15.9998Z" stroke="#2563EB" strokeWidth="2" />
              <path d="M2.66406 16H29.3307" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">PayFast</p>
            <p className="text-xs text-gray-600">Trusted South African...</p>
          </div>
        </button>

        <button
          onClick={() => onTabChange('card')}
          className={`flex-1 flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${selectedTab === 'card' ? 'border-[#9333EA] bg-pink-100' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M2.66797 16.0002C2.66797 10.9722 2.66797 8.4575 4.23064 6.89616C5.7933 5.33483 8.30664 5.3335 13.3346 5.3335H18.668C23.696 5.3335 26.2106 5.3335 27.772 6.89616C29.3333 8.45883 29.3346 10.9722 29.3346 16.0002C29.3346 21.0282 29.3346 23.5428 27.772 25.1042C26.2093 26.6655 23.696 26.6668 18.668 26.6668H13.3346C8.30664 26.6668 5.79197 26.6668 4.23064 25.1042C2.6693 23.5415 2.66797 21.0282 2.66797 16.0002Z" stroke="#9333EA" strokeWidth="2" />
              <path d="M13.3346 21.3335H8.0013M18.668 21.3335H16.668M2.66797 13.3335H29.3346" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">Card</p>
            <p className="text-xs text-gray-600">Visa, Mastercard</p>
          </div>
        </button>
      </div>

      {/* Confirmation Checkbox */}
      <div className="flex items-start gap-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPaymentConfirmed || false}
            onChange={(e) => dispatch(setIsPaymentConfirmed(e.target.checked))}
            className="sr-only"
          />
          <div className={`
                          w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                          ${isPaymentConfirmed
              ? 'bg-gradient-to-r from-pink-500 to-orange-400 border-transparent'
              : 'bg-white border-gray-300'
            }
                        `}>
            {isPaymentConfirmed && (
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <span className="text-gray-700 font-inter text-sm font-medium leading-relaxed flex-1">
           Please confirm that all gift voucher details are correct. Once payment is completed, the voucher cannot be modified or cancelled.
          </span>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;