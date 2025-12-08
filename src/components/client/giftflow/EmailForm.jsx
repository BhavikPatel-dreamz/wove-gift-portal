import React from 'react';
import { Mail } from 'lucide-react';
import { EditIcon } from 'lucide-react';
import Image from 'next/image';

const EmailForm = ({ formData, handleInputChange, errors, renderInputError, selectedSubCategory, selectedAmount, personalMessage }) => {
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
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 ">

                            {/* Email Subject */}
                            <div className="px-4 py-3 border-b border-gray-200 bg-white">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🎉</span>
                                    <p className="text-sm font-semibold text-gray-900">Wishing you Happy Birthday!!!</p>
                                </div>
                            </div>

                            {/* Email From Section */}
                            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-600">D</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900">Friend</p>
                                        <p className="text-xs text-gray-600">&lt;hello@friend.com&gt;</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">12:30 PM (40 minutes ago)</span>
                                </div>
                            </div>
                            {/* Email Content */}
                            <div className="px-12 bg-[#F8F8F8]">
                                {/* Header */}
                                <div className=" rounded-xl text-center ">
                                    <div className="bg-[linear-gradient(114.06deg,rgba(237,69,125,0.1)_11.36%,rgba(250,143,66,0.1)_90.28%)] p-4 ">
                                        <p className="text-base font-semibold text-gray-900 ">You have received a Gift card!</p>
                                    </div>

                                    {/* Greeting */}
                                    <div className="px-16 bg-white pb-3.5">
                                        <div className="text-left p-4">
                                            <p className="text-[10px] text-gray-700 mb-1">
                                                hi {formData.recipientFullName || 'jane'},
                                            </p>
                                            <p className="text-[10px] text-gray-700">
                                                Congratulations, you've received gift card from {formData.yourFullName || 'friend'}.
                                            </p>
                                        </div>

                                        {/* Personal Message */}
                                        {personalMessage && (
                                            <div className="p-3 mb-6 text-left border-l-2 border-[#DEDEDE] relative">
                                                <div className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer">
                                                    <EditIcon />
                                                </div>
                                                <p className="text-[11.18px] text-[#1A1A1A] font-medium">
                                                    "{personalMessage}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Gift Card Display */}
                                        <div className="flex items-stretch gap-3 mb-6">
                                            {/* Gift Card Image */}
                                            <div className="w-36 h-36 rounded-xl overflow-hidden bg-cyan-400 flex-shrink-0 relative shadow-md">
                                                <div className="absolute top-1 -right-4 z-10 cursor-pointer">
                                                    <EditIcon />
                                                </div>
                                                <Image
                                                    src={selectedSubCategory?.image}
                                                    width={144}
                                                    height={144}
                                                    alt="Gift card"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Gift Card Details */}
                                            <div className="flex-1 text-left bg-white rounded-xl p-4 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-base font-bold text-gray-900">
                                                                <svg width="41" height="27" viewBox="0 0 41 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path fillRule="evenodd" clipRule="evenodd" d="M38.1332 0.687125C37.4618 1.00076 36.9248 0.687125 36.0744 2.38971C33.4786 7.7663 31.4646 12.1124 29.0478 18.3403C29.1373 13.1877 30.0324 9.11045 30.5695 4.0923C30.659 3.15139 30.7933 1.89686 30.7933 0.955954C30.7933 0.239075 30.0324 0.104661 28.5555 0.866344C27.7499 1.26959 26.7653 1.22478 26.3625 2.21049C24.7513 6.37735 21.0365 17.937 19.3358 24.4785C18.933 26.0467 20.4547 26.3155 20.947 24.7025C22.0659 20.8045 24.6617 12.1572 26.2282 7.72149C26.0939 11.7987 24.975 18.2058 25.4673 21.611C25.6464 22.6863 26.631 23.1344 27.1233 24.0305C27.4813 24.6577 28.0632 24.7474 28.3765 23.8513C29.8981 19.7292 32.8073 12.4708 35.6269 6.69098C35.0898 9.24486 32.9415 20.0876 32.3597 24.4337C32.2254 25.285 33.2996 25.3298 34.2394 26.6292C34.4632 26.9428 35.2688 27.2564 35.4031 26.4947C35.8954 23.8961 39.2073 7.04942 40.4605 1.71764C40.8633 0.194271 40.7738 -0.522608 38.1332 0.687125ZM16.6057 12.9189C17.7246 11.2163 18.0827 11.5747 18.3512 11.0371C18.7092 10.4098 18.4855 9.78252 17.2323 9.91693C17.2323 9.91693 16.7848 9.96174 15.9344 10.0513C17.2771 6.60137 18.4407 3.64425 19.2911 1.44881C19.6044 0.687124 19.6491 0.149466 19.1568 0.0150511C18.6645 -0.119364 17.2323 0.687124 16.3372 0.821539C16.0687 0.911149 15.7554 1.17998 15.6659 1.404C14.3232 4.45074 13.07 7.54227 11.8616 10.6786C10.4295 10.9026 8.7735 11.2163 6.93852 11.6643C8.28119 8.25915 9.62386 4.89878 10.9218 1.67283C11.5483 0.104661 9.89239 -0.0745586 9.22106 1.53842C7.78888 5.0332 6.3567 8.57279 5.01403 12.1124C3.71612 12.426 2.32869 12.7844 0.896515 13.2325C-0.132864 13.5461 -0.17762 13.815 0.269936 14.4422C0.53847 14.8007 1.03078 14.7559 1.25456 15.0247C1.88114 15.652 2.23918 16.4584 3.31332 16.5481C2.32869 19.1467 1.38883 21.7902 0.493714 24.4337C-0.043353 26.0467 1.52309 26.4051 2.14967 24.6577C3.13429 21.8798 4.16367 19.0571 5.23781 16.2792C6.13292 16.0552 8.23643 15.6072 10.2504 15.2039C8.68399 19.5052 7.65461 22.7759 7.25181 24.3441C7.1623 24.6577 7.29657 24.837 7.38608 24.9266C7.92314 25.6883 8.41546 25.7331 9.08679 26.674C9.26581 26.9428 9.62386 26.9876 9.89239 26.7636C9.9819 26.674 10.0714 26.5395 10.1162 26.4499C11.4588 22.3727 12.9358 18.2954 14.4575 14.263C14.9498 14.1286 15.9792 13.8598 16.6057 12.9189Z" fill="#CD2026" />
                                                                    <path fillRule="evenodd" clipRule="evenodd" d="M17.6804 19.5948C17.5909 19.6844 17.4567 19.774 17.3672 19.9084C17.2329 19.55 17.1434 19.1468 17.0091 18.7883C17.3672 18.3851 17.6804 17.937 17.949 17.5338C19.1126 15.6968 16.8301 14.6663 15.8007 15.8312C15.2636 16.4585 15.3979 17.0857 15.5322 17.6234L15.7112 18.2955C15.4427 18.5643 15.0846 18.9675 14.6371 19.4604C13.5182 20.7597 13.8315 22.4623 15.0399 22.8656C15.756 23.0896 16.472 22.7759 17.0539 22.2383C17.0986 22.3279 17.0986 22.4175 17.1434 22.4623C17.4567 23.2688 18.4413 23 18.0385 22.0591C17.9937 21.8799 17.9042 21.6558 17.8147 21.387C17.9937 21.163 18.1728 20.9389 18.3518 20.6701C19.1126 19.5948 18.4413 18.9675 17.6804 19.5948ZM16.9196 17.0857C16.8301 17.2201 16.6958 17.3098 16.6063 17.4442C16.5616 17.3546 16.5616 17.2649 16.5168 17.1753C16.2035 15.9208 17.6804 16.2792 16.9196 17.0857ZM16.1588 20.9838C15.7112 21.2526 15.3532 20.9838 15.9797 20.1325C16.0692 19.998 16.2035 19.8636 16.293 19.7292C16.3825 20.0428 16.472 20.3565 16.6063 20.6701C16.4273 20.7597 16.293 20.8941 16.1588 20.9838Z" fill="#CD2026" />
                                                                </svg>

                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <p className="text-xs font-semibold text-[#1A1A1A] mb-1">Gift Code</p>
                                                        <p className="text-xs  font-medium text-[#1A1A1A]">XXX-XXX-XXX</p>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <div className="absolute top-1 -right-1 rounded-full cursor-pointer bg-white flex items-center justify-center">
                                                        <EditIcon />
                                                    </div>

                                                    <p className="text-xs text-[#1A1A1A] mb-0.5">Amount:</p>
                                                    <p className="text-xs font-medium text-[#DC3415]">
                                                        {selectedAmount.currency}
                                                        {selectedAmount.value}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
                                            onClick={() => {
                                                const url =
                                                    selectedBrand?.website ||
                                                    selectedBrand?.domain ||
                                                    `https://${selectedBrand?.slug}.myshopify.com`;

                                                const fullUrl = url.startsWith("http") ? url : `https://${url}`;
                                                window.open(fullUrl, "_blank");
                                            }}
                                        >
                                            Redeem Now
                                            <span className="text-base">↗</span>
                                        </button>
                                    </div>

                                    {/* Redeem Button */}
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