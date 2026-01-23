import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { goBack, goNext, setIsConfirmed } from '../../../redux/giftFlowSlice';
import { updateBulkCompanyInfo } from '../../../redux/cartSlice';

const BulkReviewStep = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { selectedBrand, isConfirmed } = useSelector((state) => state.giftFlowReducer);
    const { bulkItems } = useSelector((state) => state.cart);

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const isBulkMode = mode === 'bulk';


    // Get the most recent bulk item (last added)
    const currentBulkOrder = bulkItems[bulkItems.length - 1];

    // Local state only for form validation errors
    const [errors, setErrors] = useState({});

    // Get company info and delivery option from Redux state
    const companyInfo = currentBulkOrder?.companyInfo || {
        companyName: '',
        vatNumber: '',
        contactNumber: '',
        contactEmail: '',
    };

    const deliveryOption = currentBulkOrder?.deliveryOption || 'csv';

    const validateForm = () => {
        const newErrors = {};

        if (!companyInfo.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        if (!companyInfo.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        }

        if (!companyInfo.contactEmail.trim()) {
            newErrors.contactEmail = 'Contact email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyInfo.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        // Update Redux state
        dispatch(updateBulkCompanyInfo({
            companyInfo: {
                ...companyInfo,
                [field]: value
            },
            deliveryOption
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleDeliveryOptionChange = (value) => {
        // Update Redux state
        dispatch(updateBulkCompanyInfo({
            companyInfo,
            deliveryOption: value
        }));
    };

    const handleProceedToCheckout = () => {
        if (!validateForm()) {
            return;
        }

        dispatch(goNext(2));
    };

    const handleBack = () => {
        dispatch(goBack());
    };

    if (!currentBulkOrder) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4  py-30">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No bulk order found</p>
                    <button
                        onClick={() => router.push('/gift?mode=bulk')}
                        className="text-pink-500 hover:text-pink-600 font-semibold"
                    >
                        Create Bulk Order
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4  py-30 md:px-8 md:py-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Back Button and Bulk Mode Indicator */}
                <div className="relative flex flex-col items-start gap-4 mb-6
                                md:flex-row md:items-center md:justify-between md:gap-0">

                    {/* Previous Button */}
                    <button
                        className="
                              relative inline-flex items-center justify-center gap-2
                              px-5 py-3 rounded-full font-semibold text-base
                              text-[#4A4A4A] bg-white border border-transparent
                              transition-all duration-300 overflow-hidden group cursor-pointer
                            "
                        onClick={() => dispatch(goBack())}
                    >
                        {/* Outer gradient border */}
                        <span
                            className="
                                absolute inset-0 rounded-full p-[1.5px]
                                bg-gradient-to-r from-[#ED457D] to-[#FA8F42]
                              "
                        ></span>
                        <span
                            className="
                                absolute inset-[1.5px] rounded-full bg-white
                                transition-all duration-300
                                group-hover:bg-gradient-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]
                              "
                        ></span>

                        {/* Button content */}
                        <div className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
                            <svg
                                width="8"
                                height="9"
                                viewBox="0 0 8 9"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="transition-all duration-300 group-hover:[&>path]:fill-white"
                            >
                                <path
                                    d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z"
                                    fill="url(#paint0_linear_584_1923)"
                                />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear_584_1923"
                                        x1="7.5"
                                        y1="3.01721"
                                        x2="-9.17006"
                                        y2="13.1895"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#ED457D" />
                                        <stop offset="1" stopColor="#FA8F42" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            Previous
                        </div>
                    </button>

                    {/* Bulk Gifting Indicator */}
                    {isBulkMode && (
                        <div
                            className="
                        flex items-center gap-3 justify-center w-full
                        md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto
                      "
                        >
                            <div className="md:block w-30 h-px bg-gradient-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />

                            <div className="rounded-full p-px bg-gradient-to-r from-[#ED457D] to-[#FA8F42]">
                               <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                                    <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                                        Bulk Gifting
                                    </span>
                                </div>
                            </div>

                            <div className="md:block w-30 h-px bg-gradient-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
                        </div>
                    )}

                    {/* Desktop spacer only */}
                    <div className="md:block w-[140px]" />
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6 fontPoppins text-center">
                        Review your bulk gifting order
                    </h1>
                    <p className="text-[#4A4A4A] font-medium text-base">
                        Once confirmed, you'll receive all voucher codes via email in a CSV file within minutes
                    </p>
                </div>

                {/* Order Summary Card */}
                <div className="max-w-[688px] m-auto bg-[#F9F9F9] rounded-[20px] p-5 border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                    <div className="flex items-center gap-4 px-4 bg-gray-50 rounded-xl ">
                        {/* Brand Logo */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16">
                            {selectedBrand?.logo ? (
                                <img
                                    src={selectedBrand.logo}
                                    alt={selectedBrand.brandName || selectedBrand.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">
                                        {(selectedBrand?.brandName || selectedBrand?.name || 'B').substring(0, 1).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className='border-r-2 border-[#1a1a1a28]'>
                                <p className="text-[#1A1A1A] font-poppins text-base font-semibold leading-5 mb-1">
                                    Brand
                                </p>

                                <p className="text-[#4A4A4A] font-inter text-base font-normal leading-[18px]">
                                    {selectedBrand?.brandName || selectedBrand?.name}
                                </p>

                            </div>
                            <div className='border-r-2 border-[#1a1a1a28]'>
                                <p className="text-[#1A1A1A] font-poppins text-base font-semibold leading-5 mb-1">Denomination</p>
                                <p className="text-[#4A4A4A] font-inter text-base font-normal leading-[18px]">
                                    {currentBulkOrder.selectedAmount.currency}{currentBulkOrder.selectedAmount.value}
                                </p>
                            </div>
                            <div className='border-r-2 border-[#1a1a1a28]'>
                                <p className="text-[#1A1A1A] font-poppins text-base font-semibold leading-5 mb-1">Quantity</p>
                                <p className="text-[#4A4A4A] font-inter text-base font-normal leading-[18px]">{currentBulkOrder.quantity}</p>
                            </div>
                            <div>
                                <p className="text-[#1A1A1A] font-poppins text-base font-semibold leading-5 mb-1">Total Amount</p>
                                <p className="font-inter text-[20px] font-bold leading-[16px] bg-[linear-gradient(114deg,#ED457D_11.36%,#FA8F42_90.28%)] bg-clip-text text-transparent min-w-fit">
                                    {currentBulkOrder.selectedAmount.currency}{currentBulkOrder.totalSpend.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Information Card */}
                <div className="max-w-[688px] m-auto p-[1px] rounded-[20px] shadow-sm mb-6" style={{ background: 'linear-gradient(114.06deg, #ED457D 11.36%, #FA8F42 90.28%)' }}>

                    <div className="p-6 bg-[linear-gradient(180deg,#FEF8F6_0%,#FDF7F8_100%)] rounded-[20px]">
                        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 fontPoppins">Company Information</h3>

                        <div className="space-y-4">
                            {/* Company Name */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Company Name*"
                                    value={companyInfo.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    className={`w-full px-4 py-3 border bg-white ${errors.companyName ? 'border-red-500' : 'border-[#1A1A1A33]'} text-black rounded-[15px] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                />
                                {errors.companyName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                                )}
                            </div>

                            {/* VAT Number */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Vat Number (e.g., 4001234567)"
                                    value={companyInfo.vatNumber}
                                    onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                                    className="w-full px-4 py-3 border bg-white border-[#1A1A1A33] rounded-[15px]  focus:outline-none text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>

                            {/* Contact Number and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="tel"
                                        placeholder="Your Contact No.*"
                                        value={companyInfo.contactNumber}
                                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                        className={`w-full px-4 py-3 bg-white border ${errors.contactNumber ? 'border-red-500' : 'border-[#1A1A1A33]'} rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                    />
                                    {errors.contactNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Your Contact Email*"
                                        value={companyInfo.contactEmail}
                                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                        className={`w-full px-4 py-3 bg-white border ${errors.contactEmail ? 'border-red-500' : 'border-[#1A1A1A33]'} rounded-[15px] text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                    />
                                    {errors.contactEmail && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
                                    )}
                                </div>
                            </div>

                            <div className='flex gap-2'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M13.385 4.10536L10.2305 0.660492C9.8465 0.250084 9.308 0.00447932 8.693 0.00447932H4.15325C2.99975 -0.0779223 2 0.988499 2 2.21892V13.7031C1.99951 14.005 2.05489 14.304 2.16297 14.5829C2.27106 14.8619 2.42971 15.1153 2.62984 15.3287C2.82996 15.5421 3.06762 15.7113 3.32917 15.8265C3.59073 15.9417 3.87103 16.0006 4.154 16H11.846C12.129 16.0006 12.4093 15.9417 12.6708 15.8265C12.9324 15.7113 13.17 15.5421 13.3702 15.3287C13.5703 15.1153 13.7289 14.8619 13.837 14.5829C13.9451 14.304 14.0005 14.005 14 13.7031V5.66459C14 5.09018 13.769 4.51577 13.385 4.10536ZM5.69225 6.48461H8C8.3075 6.48461 8.615 6.73101 8.615 7.14062C8.615 7.55103 8.38475 7.79663 8 7.79663H5.69225C5.61118 7.79782 5.53071 7.78166 5.45559 7.74911C5.38048 7.71656 5.31224 7.66828 5.25491 7.60713C5.19758 7.54598 5.15232 7.47319 5.1218 7.39306C5.09129 7.31293 5.07614 7.2271 5.07725 7.14062C5.07725 6.73021 5.38475 6.48461 5.69225 6.48461ZM10.3077 11.0783H5.69225C5.38475 11.0783 5.07725 10.8319 5.07725 10.4223C5.07725 10.0127 5.3075 9.76627 5.69225 9.76627H10.3077C10.6152 9.76627 10.9227 10.0119 10.9227 10.4223C10.9227 10.8327 10.6152 11.0783 10.3077 11.0783Z" fill="#39AE41" />
                                </svg>
                                <span className="text-[#1A1A1A] font-inter text-xs font-medium leading-4">
                                    CSV file with voucher codes will be sent to your Contact email</span></div>

                            {/* Delivery Options */}
                            <div className="pt-4 space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="deliveryOption"
                                        value="csv"
                                        checked={deliveryOption === 'csv'}
                                        onChange={(e) => handleDeliveryOptionChange(e.target.value)}
                                        className="mt-1 w-4 h-4 focus:ring-pink-500 text-black"
                                    />
                                    <div className="flex-1">
                                        <span className="text-gray-900 font-medium">Send vouchers to multiple individuals as gifts.</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="deliveryOption"
                                        value="email"
                                        checked={deliveryOption === 'email'}
                                        onChange={(e) => handleDeliveryOptionChange(e.target.value)}
                                        className="mt-1 w-4 h-4 focus:ring-pink-500 text-black"
                                    />
                                    <div className="flex-1">
                                        <span className="text-gray-900 font-medium">Send bulk codes to my email.</span>
                                    </div>
                                </label>

                                {/* <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="multiple"
                                    checked={deliveryOption === 'multiple'}
                                    onChange={(e) => handleDeliveryOptionChange(e.target.value)}
                                    className="mt-1 w-4 h-4 text-black focus:ring-pink-500"
                                />
                                <div className="flex-1">
                                    <span className="text-gray-900 font-medium">Send vouchers to multiple individuals as gifts.</span>
                                </div>
                            </label> */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3 justify-center my-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={(e) => dispatch(setIsConfirmed(e.target.checked))}
                            className="sr-only"
                        />
                        <div className={`
                                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                    ${isConfirmed
                                ? 'bg-gradient-to-r from-pink-500 to-orange-400 border-transparent'
                                : 'bg-white border-gray-300'
                            }
                                  `}>
                            {isConfirmed && (
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
                            I have reviewed and confirmed all recipient and gift details are correct.
                        </span>
                    </label>
                </div>

                {/* Proceed Button */}
                <button
                    disabled={!isConfirmed}
                    onClick={handleProceedToCheckout}
                    className={`max-w-[688px] m-auto w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600
                         text-white py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 
                         ${isConfirmed
                            ? 'hover:shadow-xl cursor-pointer hover:opacity-95'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                >
                    Proceed to Checkout
                    <span className="text-xl"><svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
                    </svg>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default BulkReviewStep;