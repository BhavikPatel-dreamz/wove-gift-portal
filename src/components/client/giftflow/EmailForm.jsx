import React from 'react';
import { Mail } from 'lucide-react';
import { EditIcon } from 'lucide-react';
import Image from 'next/image';
import { goBack, setCurrentStep } from "../../../redux/giftFlowSlice";
import { useDispatch } from 'react-redux';

const EmailForm = ({ formData, handleInputChange, errors, renderInputError, selectedSubCategory, selectedAmount, personalMessage }) => {

    const dispatch = useDispatch();

    const goToMessageStep = () => {
        dispatch(setCurrentStep(5));
    }

    const goToAmountStep = () => {
        dispatch(setCurrentStep(2));
    }

    const goToOccationCategoryStep = () => {
        dispatch(setCurrentStep(4));
    }



    return (
        <div className="text-black">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-2 pb-8">
                <div>
                    <div className="text-left pt-8 pb-4 px-2">
                        <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">Email Details</h2>
                    </div>
                    {/* Left Side - Form */}
                    <div className="space-y-6">
                        {/* Your Information Section */}
                        <div className="rounded-2xl border border-gray-200">
                            <div className="flex items-center mb-4  border-b border-gray-200 p-4">
                                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                                    <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.0003 4.66669C15.238 4.66669 16.425 5.15835 17.3002 6.03352C18.1753 6.90869 18.667 8.09568 18.667 9.33335C18.667 10.571 18.1753 11.758 17.3002 12.6332C16.425 13.5084 15.238 14 14.0003 14C12.7626 14 11.5757 13.5084 10.7005 12.6332C9.82532 11.758 9.33366 10.571 9.33366 9.33335C9.33366 8.09568 9.82532 6.90869 10.7005 6.03352C11.5757 5.15835 12.7626 4.66669 14.0003 4.66669ZM14.0003 16.3334C19.157 16.3334 23.3337 18.4217 23.3337 21V23.3334H4.66699V21C4.66699 18.4217 8.84366 16.3334 14.0003 16.3334Z" fill="#398FAE" />
                                    </svg>

                                </div>

                                <div className="flex items-center">
                                    <h3 className="text-lg font-bold text-gray-900 ">Your Information</h3>
                                </div>
                            </div>

                            <div className="space-y-4 m-6">
                                <div>
                                    <input
                                        type="text"
                                        value={formData.yourFullName}
                                        onChange={(e) => handleInputChange('yourFullName', e.target.value)}
                                        placeholder="Your Full Name*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourFullName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                                            }`}
                                    />
                                    {renderInputError('yourFullName')}
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        value={formData.yourEmailAddress}
                                        onChange={(e) => handleInputChange('yourEmailAddress', e.target.value)}
                                        placeholder="Your Email Address*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourEmailAddress ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                                            }`}
                                    />
                                    {renderInputError('yourEmailAddress')}
                                </div>

                                <div>
                                    {/* <label className="text-xs font-semibold text-gray-600 block mb-2">Your Phone Number (Optional)</label> */}
                                    <div className="flex gap-2">
                                        {/* <select
                    value={formData.yourPhoneCountryCode}
                    onChange={(e) => handleInputChange('yourPhoneCountryCode', e.target.value)}
                    className="w-28 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white text-sm"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>{code} {country}</option>
                    ))}
                  </select> */}
                                        <div className="flex-1">
                                            <input
                                                type="tel"
                                                value={formData.yourPhoneNumber}
                                                onChange={(e) => handleInputChange('yourPhoneNumber', e.target.value)}
                                                placeholder="Your Phone Number"
                                                className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourPhoneNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                    {renderInputError('yourPhoneNumber')}
                                </div>
                            </div>
                        </div>

                        {/* Recipient Details Section */}
                        <div className="rounded-2xl border border-gray-200">
                            <div className="flex items-center border-b border-gray-200 mb-4 p-4">
                                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                                    <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                                    <Mail className="relative w-6 h-6 text-[#398FAE]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
                                </div>
                            </div>

                            <div className="space-y-4 m-6">
                                <div>
                                    <input
                                        type="text"
                                        value={formData.recipientFullName}
                                        onChange={(e) => handleInputChange('recipientFullName', e.target.value)}
                                        placeholder="Recipient's Name*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientFullName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                                            }`}
                                    />
                                    {renderInputError('recipientFullName')}
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        value={formData.recipientEmailAddress}
                                        onChange={(e) => handleInputChange('recipientEmailAddress', e.target.value)}
                                        placeholder="Email Address*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientEmailAddress ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
                                            }`}
                                    />
                                    {renderInputError('recipientEmailAddress')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Email Preview */}
                <div className="">
                    {/* Decorative Circle Background */}
                    <div className="absolute w-[420px] h-[420px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-60 -z-10"></div>

                    <div className="relative z-10 w-full">
                        {/* Email Preview Card */}
                        <div className="flex items-center justify-between text-left pt-8 pb-4 px-2">
                            <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">Preview</h2>

                        </div>
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 w-full max-w-3xl mx-auto">

                            {/* Email Subject */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🎉</span>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        Wishing you Happy Birthday!!!
                                    </p>
                                </div>
                            </div>

                            {/* Email From */}
                            <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-600">D</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">Friend</p>
                                        <p className="text-xs text-gray-600 truncate">&lt;hello@friend.com&gt;</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    12:30 PM (40 minutes ago)
                                </span>
                            </div>

                            {/* Email Content */}
                            <div className="px-4 sm:px-8 lg:px-12 bg-[#F8F8F8]">

                                {/* Header */}
                                <div className="text-center">
                                    <div className="bg-[linear-gradient(114deg,rgba(237,69,125,0.1),rgba(250,143,66,0.1))] p-4">
                                        <p className="text-sm sm:text-base font-semibold text-gray-900">
                                            You have received a Gift card!
                                        </p>
                                    </div>

                                    {/* Greeting */}
                                    <div className="bg-white px-4 sm:px-10 pb-4">
                                        <div className="text-left p-4">
                                            <p className="text-xs text-gray-700 mb-1">
                                                Hi {formData.recipientFullName || "Jane"},
                                            </p>
                                            <p className="text-xs text-gray-700">
                                                Congratulations, you've received a gift card from{" "}
                                                {formData.yourFullName || "Friend"}.
                                            </p>
                                        </div>

                                        {/* Personal Message */}
                                        {personalMessage && (
                                            <div className="p-3 mb-5 text-left border-l-2 border-gray-300 relative">
                                                <button onClick={goToMessageStep}>
                                                    <div className="absolute top-2 right-2 cursor-pointer">
                                                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" fill="white" />
                                                            <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" stroke="url(#paint0_linear_1071_3067)" strokeWidth="0.9375" />
                                                            <path d="M9.375 18.4125V20.3125C9.375 20.4875 9.5125 20.625 9.6875 20.625H11.5875C11.6688 20.625 11.75 20.5938 11.8062 20.5313L18.6312 13.7125L16.2875 11.3688L9.46875 18.1875C9.40625 18.25 9.375 18.325 9.375 18.4125ZM20.4437 11.9C20.5017 11.8422 20.5477 11.7735 20.579 11.6979C20.6104 11.6223 20.6265 11.5412 20.6265 11.4594C20.6265 11.3775 20.6104 11.2965 20.579 11.2209C20.5477 11.1453 20.5017 11.0766 20.4437 11.0188L18.9813 9.55625C18.9234 9.49831 18.8547 9.45234 18.7791 9.42098C18.7035 9.38962 18.6225 9.37347 18.5406 9.37347C18.4588 9.37347 18.3777 9.38962 18.3021 9.42098C18.2265 9.45234 18.1578 9.49831 18.1 9.55625L16.9563 10.7L19.3 13.0438L20.4437 11.9Z" fill="url(#paint1_linear_1071_3067)" />
                                                            <defs>
                                                                <linearGradient id="paint0_linear_1071_3067" x1="-2.08158e-07" y1="11.0377" x2="28.5565" y2="23.7874" gradientUnits="userSpaceOnUse">
                                                                    <stop stopColor="#ED457D" />
                                                                    <stop offset="1" stopColor="#FA8F42" />
                                                                </linearGradient>
                                                                <linearGradient id="paint1_linear_1071_3067" x1="9.375" y1="13.5132" x2="20.0851" y2="18.295" gradientUnits="userSpaceOnUse">
                                                                    <stop stopColor="#ED457D" />
                                                                    <stop offset="1" stopColor="#FA8F42" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </div>
                                                </button>
                                                <p className="text-xs text-gray-900 font-medium">
                                                    “{personalMessage}”
                                                </p>
                                            </div>
                                        )}

                                        {/* Gift Card */}
                                        <div className="flex flex-col sm:flex-row gap-4 mb-6">

                                            {/* Image */}
                                            <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden relative shadow-md">
                                                <button onClick={goToOccationCategoryStep}>
                                                    <div className="absolute top-1 right-1 z-10 cursor-pointer bg-white rounded-full">
                                                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" fill="white" />
                                                            <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" stroke="url(#paint0_linear_1071_3067)" strokeWidth="0.9375" />
                                                            <path d="M9.375 18.4125V20.3125C9.375 20.4875 9.5125 20.625 9.6875 20.625H11.5875C11.6688 20.625 11.75 20.5938 11.8062 20.5313L18.6312 13.7125L16.2875 11.3688L9.46875 18.1875C9.40625 18.25 9.375 18.325 9.375 18.4125ZM20.4437 11.9C20.5017 11.8422 20.5477 11.7735 20.579 11.6979C20.6104 11.6223 20.6265 11.5412 20.6265 11.4594C20.6265 11.3775 20.6104 11.2965 20.579 11.2209C20.5477 11.1453 20.5017 11.0766 20.4437 11.0188L18.9813 9.55625C18.9234 9.49831 18.8547 9.45234 18.7791 9.42098C18.7035 9.38962 18.6225 9.37347 18.5406 9.37347C18.4588 9.37347 18.3777 9.38962 18.3021 9.42098C18.2265 9.45234 18.1578 9.49831 18.1 9.55625L16.9563 10.7L19.3 13.0438L20.4437 11.9Z" fill="url(#paint1_linear_1071_3067)" />
                                                            <defs>
                                                                <linearGradient id="paint0_linear_1071_3067" x1="-2.08158e-07" y1="11.0377" x2="28.5565" y2="23.7874" gradientUnits="userSpaceOnUse">
                                                                    <stop stopColor="#ED457D" />
                                                                    <stop offset="1" stopColor="#FA8F42" />
                                                                </linearGradient>
                                                                <linearGradient id="paint1_linear_1071_3067" x1="9.375" y1="13.5132" x2="20.0851" y2="18.295" gradientUnits="userSpaceOnUse">
                                                                    <stop stopColor="#ED457D" />
                                                                    <stop offset="1" stopColor="#FA8F42" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </div>
                                                </button>
                                                <Image
                                                    src={selectedSubCategory?.image}
                                                    alt="Gift card"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 bg-white rounded-xl p-4 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-800 mb-1">
                                                        Gift Code
                                                    </p>
                                                    <p className="text-xs font-medium mb-3">XXX-XXX-XXX</p>
                                                </div>

                                                <div className="relative">
                                                    <button onClick={goToAmountStep}>
                                                        <div className="absolute top-0 right-0 cursor-pointer">
                                                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" fill="white" />
                                                                <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" stroke="url(#paint0_linear_1071_3067)" strokeWidth="0.9375" />
                                                                <path d="M9.375 18.4125V20.3125C9.375 20.4875 9.5125 20.625 9.6875 20.625H11.5875C11.6688 20.625 11.75 20.5938 11.8062 20.5313L18.6312 13.7125L16.2875 11.3688L9.46875 18.1875C9.40625 18.25 9.375 18.325 9.375 18.4125ZM20.4437 11.9C20.5017 11.8422 20.5477 11.7735 20.579 11.6979C20.6104 11.6223 20.6265 11.5412 20.6265 11.4594C20.6265 11.3775 20.6104 11.2965 20.579 11.2209C20.5477 11.1453 20.5017 11.0766 20.4437 11.0188L18.9813 9.55625C18.9234 9.49831 18.8547 9.45234 18.7791 9.42098C18.7035 9.38962 18.6225 9.37347 18.5406 9.37347C18.4588 9.37347 18.3777 9.38962 18.3021 9.42098C18.2265 9.45234 18.1578 9.49831 18.1 9.55625L16.9563 10.7L19.3 13.0438L20.4437 11.9Z" fill="url(#paint1_linear_1071_3067)" />
                                                                <defs>
                                                                    <linearGradient id="paint0_linear_1071_3067" x1="-2.08158e-07" y1="11.0377" x2="28.5565" y2="23.7874" gradientUnits="userSpaceOnUse">
                                                                        <stop stopColor="#ED457D" />
                                                                        <stop offset="1" stopColor="#FA8F42" />
                                                                    </linearGradient>
                                                                    <linearGradient id="paint1_linear_1071_3067" x1="9.375" y1="13.5132" x2="20.0851" y2="18.295" gradientUnits="userSpaceOnUse">
                                                                        <stop stopColor="#ED457D" />
                                                                        <stop offset="1" stopColor="#FA8F42" />
                                                                    </linearGradient>
                                                                </defs>
                                                            </svg>
                                                        </div>
                                                    </button>
                                                    <p className="text-xs text-gray-700">Amount</p>
                                                    <p className="text-sm font-semibold text-[#DC3415]">
                                                        {selectedAmount?.currency}
                                                        {selectedAmount.value}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Redeem Button */}
                                        <button
                                            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                                            onClick={() => {
                                                const url =
                                                    selectedBrand?.website ||
                                                    selectedBrand?.domain ||
                                                    `https://${selectedBrand?.slug}.myshopify.com`;

                                                window.open(url.startsWith("http") ? url : `https://${url}`, "_blank");
                                            }}
                                        >
                                            Redeem Now
                                            <span>↗</span>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailForm;