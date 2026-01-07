import { User } from "lucide-react";
import { Phone } from "lucide-react";
import { MessageCircleCode } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import React from "react";
import Image from "next/image";
import { Edit } from "lucide-react";
import { useDispatch } from "react-redux";

const WhatsAppForm = ({
  formData,
  handleInputChange,
  errors,
  renderInputError,
  selectedSubCategory,
  selectedAmount,
  personalMessage,
}) => {
  const dispatch = useDispatch();

  const goToMessageStep = () => {
    dispatch(setCurrentStep(5));
  };

  const goToAmountStep = () => {
    dispatch(setCurrentStep(2));
  };

  const goToOccationCategoryStep = () => {
    dispatch(setCurrentStep(4));
  };

  return (
    <div className="text-black">
      <div className="text-center pt-8 pb-4 px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          WhatsApp Details
        </h2>
        <p className="text-gray-600 text-sm">
          We'll send the gift card directly to their WhatsApp
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          with your personal message.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-8 pb-6">
        {/* Left Side - Form */}
        <div className="space-y-6">
          {/* Your Details Section */}
          <div className="rounded-2xl border border-gray-200">
            <div className="bg-green-50 flex items-start mb-4 border-b border-[#39AE41] p-4 rounded-t-2xl">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mr-3 shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-2xl"></div>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 sm:w-7 sm:h-7"
                >
                  <path
                    d="M14.0003 4.66669C15.238 4.66669 16.425 5.15835 17.3002 6.03352C18.1753 6.90869 18.667 8.09568 18.667 9.33335C18.667 10.571 18.1753 11.758 17.3002 12.6332C16.425 13.5084 15.238 14 14.0003 14C12.7626 14 11.5757 13.5084 10.7005 12.6332C9.82532 11.758 9.33366 10.571 9.33366 9.33335C9.33366 8.09568 9.82532 6.90869 10.7005 6.03352C11.5757 5.15835 12.7626 4.66669 14.0003 4.66669ZM14.0003 16.3334C19.157 16.3334 23.3337 18.4217 23.3337 21V23.3334H4.66699V21C4.66699 18.4217 8.84366 16.3334 14.0003 16.3334Z"
                    fill="#39AE41"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Your Details
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Enter your information for the gift receipt
                </p>
              </div>
            </div>

            <div className="space-y-4 m-4 sm:m-6">
              <div>
                <input
                  type="text"
                  value={formData.yourName}
                  onChange={(e) =>
                    handleInputChange("yourName", e.target.value)
                  }
                  placeholder="Your Full Name*"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${
                    errors.yourName
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-green-400 focus:border-green-400"
                  }`}
                />
                {renderInputError("yourName")}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">
                  Your WhatsApp Number*
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.yourWhatsAppNumber}
                      onChange={(e) =>
                        handleInputChange("yourWhatsAppNumber", e.target.value)
                      }
                      placeholder="Your WhatsApp No*"
                      className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${
                        errors.yourWhatsAppNumber
                          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-200 focus:ring-green-400 focus:border-green-400"
                      }`}
                    />
                  </div>
                </div>
                {renderInputError("yourWhatsAppNumber")}
              </div>
            </div>
          </div>

          {/* Recipient Details Section */}
          <div className="rounded-2xl border border-gray-200">
            <div className="bg-green-50 flex items-start mb-4 border-b border-[#39AE41] p-4 rounded-t-2xl">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mr-3 shrink-0">
                <div className="absolute inset-0 bg-[#39AE41] opacity-20 rounded-2xl"></div>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 sm:w-7 sm:h-7"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4 6.83619C4 6.08399 4.29716 5.36259 4.82611 4.8307C5.35506 4.29881 6.07247 4 6.82051 4H21.1795C21.9275 4 22.6449 4.29881 23.1739 4.8307C23.7028 5.36259 24 6.08399 24 6.83619V17.1496C24 17.9018 23.7028 18.6232 23.1739 19.1551C22.6449 19.687 21.9275 19.9858 21.1795 19.9858H9.85744C9.46769 19.9858 9.09949 20.1642 8.85641 20.4706L6.46667 23.4749C5.64821 24.5021 4 23.9214 4 22.6054V6.83619Z"
                    fill="#39AE41"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Recipient Details
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Who are you sending this gift to?
                </p>
              </div>
            </div>

            <div className="space-y-4 m-4 sm:m-6">
              <div>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) =>
                    handleInputChange("recipientName", e.target.value)
                  }
                  placeholder="Recipient's Name*"
                  className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${
                    errors.recipientName
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-green-400 focus:border-green-400"
                  }`}
                />
                {renderInputError("recipientName")}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">
                  Recipient's WhatsApp Number*
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.recipientWhatsAppNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "recipientWhatsAppNumber",
                          e.target.value
                        )
                      }
                      placeholder="Your WhatsApp No.*"
                      className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${
                        errors.recipientWhatsAppNumber
                          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-200 focus:ring-green-400 focus:border-green-400"
                      }`}
                    />
                  </div>
                </div>
                {renderInputError("recipientWhatsAppNumber")}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - WhatsApp Phone Preview */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 relative">
          {/* Decorative Circle Background */}
          <div className="absolute w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-green-100 to-green-200 rounded-full opacity-40 blur-3xl -z-10"></div>

          {/* Mobile Phone Mockup */}
          <div className="relative z-10">
            <div className="w-[240px] h-[500px] sm:w-[280px] sm:h-[580px] bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] p-2 sm:p-2.5 shadow-2xl">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 sm:w-32 sm:h-6 bg-gray-900 rounded-b-3xl z-20"></div>

              <div className="w-full h-full bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-9 sm:h-11 bg-white z-10 flex items-center justify-between px-4 sm:px-6 pt-2">
                  <span className="text-[10px] sm:text-xs font-semibold">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-2.5 sm:w-4 sm:h-3 border border-gray-900 rounded-sm relative">
                      <div className="absolute inset-0.5 bg-gray-900 rounded-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Chat Header */}
                <div className="bg-white px-2.5 sm:px-3 pt-9 sm:pt-11 pb-2 sm:pb-2.5 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center flex-1">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-1.5 sm:mr-2" />
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-pink-500 rounded-full flex items-center justify-center mr-1.5 sm:mr-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        Friend
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                        Tap here for contact info
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-2">
                    <MessageCircleCode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 bg-white p-2 sm:p-3 overflow-y-auto">
                  <div className="flex justify-start mb-3">
                    <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg border border-gray-100 p-2.5 sm:p-3.5 max-w-[90%]">
                      {/* Gift Card Image */}
                      <div className="rounded-xl mb-2 sm:mb-3 overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 aspect-video flex items-center justify-center">
                        <img
                          src={selectedSubCategory?.image}
                          alt="Gift Card"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Gift Details */}
                      <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs text-gray-900">
                          Friend Sent you a gift card
                        </p>
                        <p className="text-base sm:text-lg font-bold text-red-500">
                          {selectedAmount.currency}
                          {selectedAmount.value}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed italic">
                          "{personalMessage}"
                        </p>
                      </div>

                      {/* Gift Code Section */}
                      <div className="space-y-0.5 mb-2 sm:mb-3">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
                          Gift Code
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 font-mono">
                          XXX-XXXX-XXXX
                        </p>
                      </div>

                      <div className="w-full h-px bg-gray-200 my-2 sm:my-2.5"></div>

                      {/* Claim Button */}
                      <button
                        className="w-full text-green-500 text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium flex items-center justify-center transition-colors hover:bg-green-50"
                        onClick={() => {
                          const url =
                            selectedBrand?.website ||
                            selectedBrand?.domain ||
                            `https://${selectedBrand?.slug}.myshopify.com`;

                          const fullUrl = url.startsWith("http")
                            ? url
                            : `https://${url}`;
                          window.open(fullUrl, "_blank");
                        }}
                      >
                        Claim Gift →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="bg-white border-t border-gray-200 px-2 sm:px-2.5 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
                  <button className="text-blue-500 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                    <span className="text-lg sm:text-xl leading-none">+</span>
                  </button>
                  <div className="flex-1 bg-gray-100 rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2">
                    <span className="text-[10px] sm:text-xs text-gray-400">Message</span>
                  </div>
                  <button className="text-gray-400 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-sm sm:text-base">
                    📷
                  </button>
                  <button className="text-gray-400 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-sm sm:text-base">
                    🎤
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Buttons - Stacked on Mobile, Side on Desktop */}
          <div className="flex flex-row lg:flex-col gap-3 flex-wrap justify-center lg:justify-start">
            <div
              className="
  p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-400
  inline-block
  transition-all duration-300
  hover:scale-[1.03]
  hover:shadow-[0_8px_30px_rgba(244,63,94,0.35)] max-w-fit
"
            >
              <button
                onClick={() => dispatch(setCurrentStep(4))}
                className="
      flex items-center gap-2
      px-4 py-2.5 sm:px-5 sm:py-3 rounded-full
      bg-white text-gray-800 font-medium text-xs sm:text-sm
      transition-all duration-300
      hover:bg-rose-50
      active:scale-[0.97] max-w-fit
    "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                >
                  <path
                    d="M2 11.64V13.6666C2 13.8533 2.14667 14 2.33333 14H4.36C4.44667 14 4.53333 13.9666 4.59333 13.9L11.8733 6.62665L9.37333 4.12665L2.1 11.4C2.03333 11.4666 2 11.5466 2 11.64ZM13.8067 4.69332C13.8685 4.63164 13.9175 4.55838 13.951 4.47773C13.9844 4.39708 14.0016 4.31063 14.0016 4.22331C14.0016 4.136 13.9844 4.04955 13.951 3.9689C13.9175 3.88825 13.8685 3.81499 13.8067 3.75331L12.2467 2.19331C12.185 2.13151 12.1117 2.08248 12.0311 2.04903C11.9504 2.01557 11.864 1.99835 11.7767 1.99835C11.6894 1.99835 11.6029 2.01557 11.5223 2.04903C11.4416 2.08248 11.3683 2.13151 11.3067 2.19331L10.0867 3.41331L12.5867 5.91331L13.8067 4.69332Z"
                    fill="url(#paint0_linear_1052_2197)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_1052_2197"
                      x1="2"
                      y1="6.41405"
                      x2="13.4241"
                      y2="11.5146"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#ED457D" />
                      <stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                  </defs>
                </svg>
                Edit Card
              </button>
            </div>

            <div
              className="
  p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-400
  inline-block
  transition-all duration-300
  hover:scale-[1.03]
  hover:shadow-[0_8px_30px_rgba(244,63,94,0.35)] max-w-fit
"
            >
              <button
                onClick={() => dispatch(setCurrentStep(2))}
                className="
      flex items-center gap-2
      px-4 py-2.5 sm:px-5 sm:py-3 rounded-full
      bg-white text-gray-800 font-medium text-xs sm:text-sm
      transition-all duration-300
      hover:bg-rose-50
      active:scale-[0.97]
    "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                >
                  <path
                    d="M2 11.64V13.6666C2 13.8533 2.14667 14 2.33333 14H4.36C4.44667 14 4.53333 13.9666 4.59333 13.9L11.8733 6.62665L9.37333 4.12665L2.1 11.4C2.03333 11.4666 2 11.5466 2 11.64ZM13.8067 4.69332C13.8685 4.63164 13.9175 4.55838 13.951 4.47773C13.9844 4.39708 14.0016 4.31063 14.0016 4.22331C14.0016 4.136 13.9844 4.04955 13.951 3.9689C13.9175 3.88825 13.8685 3.81499 13.8067 3.75331L12.2467 2.19331C12.185 2.13151 12.1117 2.08248 12.0311 2.04903C11.9504 2.01557 11.864 1.99835 11.7767 1.99835C11.6894 1.99835 11.6029 2.01557 11.5223 2.04903C11.4416 2.08248 11.3683 2.13151 11.3067 2.19331L10.0867 3.41331L12.5867 5.91331L13.8067 4.69332Z"
                    fill="url(#paint0_linear_1052_2198)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_1052_2198"
                      x1="2"
                      y1="6.41405"
                      x2="13.4241"
                      y2="11.5146"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#ED457D" />
                      <stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                  </defs>
                </svg>
                Edit Amount
              </button>
            </div>

            <div
              className="
  p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-400
  inline-block
  transition-all duration-300
  hover:scale-[1.03]
  hover:shadow-[0_8px_30px_rgba(244,63,94,0.35)]
"
            >
              <button
                onClick={() => dispatch(setCurrentStep(5))}
                className="
      flex items-center gap-2
      px-4 py-2.5 sm:px-5 sm:py-3 rounded-full
      bg-white text-gray-800 font-medium text-xs sm:text-sm
      transition-all duration-300
      hover:bg-rose-50
      active:scale-[0.97]
    "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                >
                  <path
                    d="M2 11.64V13.6666C2 13.8533 2.14667 14 2.33333 14H4.36C4.44667 14 4.53333 13.9666 4.59333 13.9L11.8733 6.62665L9.37333 4.12665L2.1 11.4C2.03333 11.4666 2 11.5466 2 11.64ZM13.8067 4.69332C13.8685 4.63164 13.9175 4.55838 13.951 4.47773C13.9844 4.39708 14.0016 4.31063 14.0016 4.22331C14.0016 4.136 13.9844 4.04955 13.951 3.9689C13.9175 3.88825 13.8685 3.81499 13.8067 3.75331L12.2467 2.19331C12.185 2.13151 12.1117 2.08248 12.0311 2.04903C11.9504 2.01557 11.864 1.99835 11.7767 1.99835C11.6894 1.99835 11.6029 2.01557 11.5223 2.04903C11.4416 2.08248 11.3683 2.13151 11.3067 2.19331L10.0867 3.41331L12.5867 5.91331L13.8067 4.69332Z"
                    fill="url(#paint0_linear_1052_2199)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_1052_2199"
                      x1="2"
                      y1="6.41405"
                      x2="13.4241"
                      y2="11.5146"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#ED457D" />
                      <stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                  </defs>
                </svg>
                Edit Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppForm;