import { User } from 'lucide-react';
import { Phone } from 'lucide-react';
import { MessageCircleCode } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import Image from 'next/image';


const WhatsAppForm = ({ formData, handleInputChange, errors, renderInputError,selectedSubCategory,selectedAmount,personalMessage }) => {

  return (
      <div className="text-black">
      <div className="text-center pt-8 pb-4 px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Details</h2>
        <p className="text-gray-600 text-sm">
          We'll send the gift card directly to their WhatsApp<br />
          with your personal message.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 pb-8">
        {/* Left Side - Form */}
        <div className="space-y-6">
          {/* Your Details Section */}
          <div className="rounded-2xl border border-gray-200">
            <div className="bg-green-50 flex items-start mb-4 border-b border-[#39AE41] p-4">
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-xl"></div>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.0003 4.66669C15.238 4.66669 16.425 5.15835 17.3002 6.03352C18.1753 6.90869 18.667 8.09568 18.667 9.33335C18.667 10.571 18.1753 11.758 17.3002 12.6332C16.425 13.5084 15.238 14 14.0003 14C12.7626 14 11.5757 13.5084 10.7005 12.6332C9.82532 11.758 9.33366 10.571 9.33366 9.33335C9.33366 8.09568 9.82532 6.90869 10.7005 6.03352C11.5757 5.15835 12.7626 4.66669 14.0003 4.66669ZM14.0003 16.3334C19.157 16.3334 23.3337 18.4217 23.3337 21V23.3334H4.66699V21C4.66699 18.4217 8.84366 16.3334 14.0003 16.3334Z" fill="#39AE41" />
                </svg>

              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Details</h3>
                <p className="text-sm text-gray-600">Enter your information for the gift receipt</p>
              </div>
            </div>

            <div className="space-y-4 m-6">
              <div>
                <input
                  type="text"
                  value={formData.yourName}
                  onChange={(e) => handleInputChange('yourName', e.target.value)}
                  placeholder="Your Full Name*"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                    }`}
                />
                {renderInputError('yourName')}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Your WhatsApp Number*</label>
                <div className="flex gap-2">
                  {/* <select
                    value={formData.yourCountryCode}
                    onChange={(e) => handleInputChange('yourCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select> */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.yourWhatsAppNumber}
                      onChange={(e) => handleInputChange('yourWhatsAppNumber', e.target.value)}
                      placeholder="Your WhatsApp No*"
                      className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourWhatsAppNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                        }`}
                    />
                  </div>
                </div>
                {renderInputError('yourWhatsAppNumber')}
              </div>
            </div>
          </div>

          {/* Recipient Details Section */}
          <div className="rounded-2xl border border-gray-200">
            <div className="bg-green-50 flex items-start mb-4 border-b border-[#39AE41] p-4">
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-xl"></div>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 6.83619C4 6.08399 4.29716 5.36259 4.82611 4.8307C5.35506 4.29881 6.07247 4 6.82051 4H21.1795C21.9275 4 22.6449 4.29881 23.1739 4.8307C23.7028 5.36259 24 6.08399 24 6.83619V17.1496C24 17.9018 23.7028 18.6232 23.1739 19.1551C22.6449 19.687 21.9275 19.9858 21.1795 19.9858H9.85744C9.46769 19.9858 9.09949 20.1642 8.85641 20.4706L6.46667 23.4749C5.64821 24.5021 4 23.9214 4 22.6054V6.83619Z" fill="#39AE41" />
                </svg>

              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
                <p className="text-sm text-gray-600">Who are you sending this gift to?</p>
              </div>
            </div>

            <div className="space-y-4 m-6">
              <div>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="Recipient's Name*"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                    }`}
                />
                {renderInputError('recipientName')}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Recipient's WhatsApp Number*</label>
                <div className="flex gap-2">
                  {/* <select
                    value={formData.recipientCountryCode}
                    onChange={(e) => handleInputChange('recipientCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select> */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.recipientWhatsAppNumber}
                      onChange={(e) => handleInputChange('recipientWhatsAppNumber', e.target.value)}
                      placeholder="Your WhatsApp No.*"
                      className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientWhatsAppNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-green-400 focus:border-green-400'
                        }`}
                    />
                  </div>
                </div>
                {renderInputError('recipientWhatsAppNumber')}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - WhatsApp Phone Preview */}
        <div className="flex items-center justify-center relative">
          {/* Decorative Circle Background */}
          <div className="absolute w-[500px] h-[420px] bg-linear-to-br from-green-100 to-green-200 rounded-full opacity-60 -z-10"></div>

          <div className="relative z-10">
            <div className="w-[280px] h-[560px] bg-black rounded-[3rem] p-2.5 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                {/* Phone Status Bar */}
                <div className="bg-white px-3 py-2.5 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center flex-1">
                    <ArrowLeft className="w-5 h-5 text-gray-700 mr-2" />
                    <div className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">Friend</div>
                      <div className="text-xs text-gray-500 truncate">Tap here for contact info</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <MessageCircleCode className="w-5 h-5 text-gray-600" />
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 bg-linear-to-b from-green-50 to-green-100 p-3 overflow-y-auto">
                  <div className="flex justify-start mb-3">
                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-md p-3.5 max-w-[90%]">
                      <div className="rounded-xl mb-3 text-center">
                        <Image
                          src={selectedSubCategory?.image}
                          width={500}
                          height={500}
                          alt="Occation category"
                        />
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-900">Friend Sent you a gift card</p>
                        <p className="text-sm font-bold text-red-500">{selectedAmount.currency + " " + selectedAmount.value}</p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          "{personalMessage}"
                        </p>
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-900">Gift Code</p>
                          <p className="text-xs text-gray-700 leading-relaxed">XXXX XXXX XXXX</p>
                        </div>
                      </div>

                      <div className="w-[95%] mx-auto h-px bg-[#1A1A1A33] my-1"></div>

                      <button
                        className="w-full text-[#39AE41] text-xs py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                        onClick={() => {
                          const url =
                            selectedBrand?.website ||
                            selectedBrand?.domain ||
                            `https://${selectedBrand?.slug}.myshopify.com`;

                          // Ensure it has https:// prefix
                          const fullUrl = url.startsWith("http") ? url : `https://${url}`;
                          window.open(fullUrl, "_blank");
                        }}
                      >
                        Claim Gift →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="bg-white border-t border-gray-200 px-2.5 py-2 flex items-center gap-2">
                  <button className="text-gray-400 w-7 h-7 flex items-center justify-center">
                    <span className="text-xl leading-none">+</span>
                  </button>
                  <div className="flex-1 bg-gray-100 rounded-full px-3 py-2">
                    <span className="text-xs text-gray-400">Message</span>
                  </div>
                  <button className="text-gray-400 w-7 h-7 flex items-center justify-center text-base">📷</button>
                  <button className="text-gray-400 w-7 h-7 flex items-center justify-center text-base">🎤</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppForm;