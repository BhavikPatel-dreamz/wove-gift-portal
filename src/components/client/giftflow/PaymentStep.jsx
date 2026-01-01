import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { goBack } from "../../../redux/giftFlowSlice";
import { createOrder } from "../../../lib/action/orderAction";
import convertToSubcurrency from "../../../lib/convertToSubcurrency";

// Import components
import StripeCardPayment from "./payment/StripeCardPayment";
import PaymentMethodSelector from "./payment/PaymentMethodSelector";
import GiftDetailsCard from "./payment/GiftDetailsCard";
import PaymentSummary from "./payment/PaymentSummary";
import BulkPaymentSummary from "./payment/BulkPaymentSummary";
import SuccessScreen from "./payment/SuccessScreen";
import ThankYouScreen from "./payment/ThankYouScreen";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const PaymentStep = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [voucherCode, setVoucherCode] = useState(null);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('card');
  const [showThankYou, setShowThankYou] = useState(false);

  // Redux selectors
  const {
    selectedBrand,
    selectedAmount: giftFlowAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
    selectedOccasionName
  } = useSelector((state) => state.giftFlowReducer);

  const { bulkItems } = useSelector((state) => state.cart);
  const currentBulkOrder = isBulkMode && bulkItems.length > 0 ? bulkItems[bulkItems.length - 1] : null;

  // Derived values
  const selectedAmount = isBulkMode && currentBulkOrder ? currentBulkOrder.selectedAmount : giftFlowAmount;
  const quantity = isBulkMode && currentBulkOrder ? currentBulkOrder.quantity : 1;
  const companyInfo = isBulkMode && currentBulkOrder ? currentBulkOrder.companyInfo : null;
  const bulkDeliveryOption = isBulkMode && currentBulkOrder ? currentBulkOrder.deliveryOption : null;

  // Helper functions
  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency}${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    return Math.round(totalAmount * 0.03);
  };

  const calculateTotal = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    const serviceFee = calculateServiceFee();
    return totalAmount + serviceFee;
  };

  // Payment handler
  const handlePayment = async (paymentData) => {
    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Processing your order...');

    try {
      const orderData = isBulkMode ? {
        selectedBrand,
        selectedAmount,
        personalMessage,
        quantity,
        companyInfo,
        deliveryOption: bulkDeliveryOption,
        selectedOccasion,
        selectedSubCategory,
        selectedPaymentMethod: 'card',
        paymentData,
        totalAmount: calculateTotal(),
        isBulkOrder: true,
        totalSpend: currentBulkOrder.totalSpend,
      } : {
        selectedBrand,
        selectedAmount,
        personalMessage,
        deliveryMethod,
        deliveryDetails,
        selectedOccasion,
        selectedSubCategory,
        selectedTiming,
        selectedPaymentMethod: 'card',
        paymentData,
        totalAmount: calculateTotal(),
        isBulkOrder: false,
      };

      const result = await createOrder(orderData);
      
      if (result?.success) {
        setOrder(result?.data?.order);
        setVoucherCode(result?.data?.voucherCode);
        toast.success(
          isBulkMode ? 'Bulk order placed successfully!' : 'Order placed successfully!', 
          { id: toastId }
        );
      } else {
        setError(result.error);
        toast.error(result.error, { id: toastId });
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    setShowThankYou(true);
  };

  // Render success screens
  if (order) {
    if (showThankYou) {
      return <ThankYouScreen />;
    }

    return (
      <SuccessScreen
        order={order}
        selectedBrand={selectedBrand}
        quantity={quantity}
        selectedAmount={selectedAmount}
        isBulkMode={isBulkMode}
        onNext={handleNext}
      />
    );
  }

  // Main payment form
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-30 md:px-8 md:py-30">
      <Toaster />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
            <button
              onClick={() => dispatch(goBack())}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 
                         transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)" />
                <defs>
                  <linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ED457D" />
                    <stop offset="1" stopColor="#FA8F42" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-base font-semibold text-gray-800">Previous</span>
            </button>
          </div>

          {/* Bulk Mode Badge */}
          {isBulkMode && (
            <div className="w-full flex items-center justify-center mb-4">
              <div className="max-w-[214px] w-full h-px bg-linear-to-r from-transparent via-[#FA8F42] to-[#ED457D]"></div>
              <div className="rounded-full p-px bg-linear-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 py-1.5 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">
                    Bulk Gifting
                  </span>
                </div>
              </div>
              <div className="max-w-[214px] w-full h-px bg-linear-to-l from-transparent via-[#ED457D] to-[#FA8F42]"></div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            {isBulkMode ? 'Complete your payment securely' : "You're almost there!"}
          </h1>
          <p className="text-gray-600 text-center">
            {isBulkMode
              ? 'Your vouchers will be generated instantly after payment'
              : "Let's deliver your beautiful gift and make someone's day absolutely wonderful"}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Payment Method */}
          <div className="space-y-6">
            <PaymentMethodSelector
              selectedTab={selectedPaymentTab}
              onTabChange={setSelectedPaymentTab}
              isBulkMode={isBulkMode}
            />

            {/* Stripe Payment Form */}
            {selectedPaymentTab === 'card' && (
              <Elements
                stripe={stripePromise}
                options={{
                  mode: "payment",
                  amount: convertToSubcurrency(calculateTotal()),
                  currency: "usd",
                }}
              >
                <StripeCardPayment
                  total={convertToSubcurrency(calculateTotal())}
                  isProcessing={isProcessing}
                  onPayment={handlePayment}
                />
              </Elements>
            )}
          </div>

          {/* Right Column - Gift Details & Summary */}
          <div className="space-y-6">
            {/* Gift Details (Single Mode Only) */}
            {!isBulkMode && (
              <GiftDetailsCard
                selectedBrand={selectedBrand}
                selectedAmount={selectedAmount}
                selectedSubCategory={selectedSubCategory}
                selectedOccasionName={selectedOccasionName}
                personalMessage={personalMessage}
                deliveryMethod={deliveryMethod}
                deliveryDetails={deliveryDetails}
                formatAmount={formatAmount}
                isBulkMode={isBulkMode}
                quantity={quantity}
                companyInfo={companyInfo}
              />
            )}

            {/* Payment Summary */}
            {isBulkMode ? (
              <BulkPaymentSummary
                currentBulkOrder={currentBulkOrder}
                quantity={quantity}
                selectedAmount={selectedAmount}
                calculateServiceFee={calculateServiceFee}
                calculateTotal={calculateTotal}
              />
            ) : (
              <PaymentSummary
                selectedAmount={selectedAmount}
                formatAmount={formatAmount}
                calculateServiceFee={calculateServiceFee}
                calculateTotal={calculateTotal}
                isBulkMode={isBulkMode}
                quantity={quantity}
              />
            )}

            {/* Company Details for Bulk Orders */}
            {isBulkMode && companyInfo && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-4">Company Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-semibold text-gray-900">{companyInfo.companyName}</span>
                  </div>
                  {companyInfo.vatNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT Number:</span>
                      <span className="font-semibold text-gray-900">{companyInfo.vatNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-semibold text-gray-900">{companyInfo.contactNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900 break-all">{companyInfo.contactEmail}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 max-w-6xl mx-auto">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <p className="font-semibold text-red-800">Payment Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;