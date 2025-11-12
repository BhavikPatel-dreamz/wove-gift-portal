import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { goBack, goNext } from '../../../redux/giftFlowSlice';
import { updateBulkCompanyInfo } from '../../../redux/cartSlice';

const BulkReviewStep = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const { selectedBrand } = useSelector((state) => state.giftFlowReducer);
    const { bulkItems } = useSelector((state) => state.cart);

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Previous Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-pink-500 hover:text-pink-600 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Previous</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block px-4 py-1.5 bg-white border border-pink-300 rounded-full mb-4">
                        <span className="text-pink-500 font-semibold text-sm">Bulk Gifting</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Review your bulk gifting order
                    </h1>
                    <p className="text-gray-600">
                        Once confirmed, you'll receive all voucher codes via email in a CSV file within minutes
                    </p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        {/* Brand Logo */}
                        <div className="w-16 h-16 flex-shrink-0">
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
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Brand</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedBrand?.brandName || selectedBrand?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Denomination</p>
                                <p className="font-semibold text-gray-900">
                                    {currentBulkOrder.selectedAmount.currency}{currentBulkOrder.selectedAmount.value}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                <p className="font-semibold text-gray-900">{currentBulkOrder.quantity}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                <p className="font-bold text-pink-600 text-lg">
                                    {currentBulkOrder.selectedAmount.currency}{currentBulkOrder.totalSpend.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Information Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Company Information</h3>

                    <div className="space-y-4">
                        {/* Company Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Your Company Name*"
                                value={companyInfo.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                className={`w-full px-4 py-3 border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                                    className={`w-full px-4 py-3 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
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
                                    className={`w-full px-4 py-3 border ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                />
                                {errors.contactEmail && (
                                    <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
                                )}
                            </div>
                        </div>

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
                                    <span className="text-gray-900 font-medium">CSV file with voucher codes will be sent to my email</span>
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
                                    <span className="text-gray-900 font-medium">Send bulk codes to my email</span>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
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
                            </label>
                        </div>
                    </div>
                </div>

                {/* Proceed Button */}
                <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    Proceed to Checkout
                    <span className="text-xl">▶</span>
                </button>
            </div>
        </div>
    );
};

export default BulkReviewStep;