import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { goBack, setCurrentStep } from "../../../redux/giftFlowSlice";
import { createPendingOrder, getOrderStatus } from "../../../lib/action/orderAction";
import convertToSubcurrency from "../../../lib/convertToSubcurrency";

// Import components
import StripeCardPayment from "./payment/StripeCardPayment";
import PaymentMethodSelector from "./payment/PaymentMethodSelector";
import GiftDetailsCard from "./payment/GiftDetailsCard";
import PaymentSummary from "./payment/PaymentSummary";
import BulkPaymentSummary from "./payment/BulkPaymentSummary";
import SuccessScreen from "./payment/SuccessScreen";
import ThankYouScreen from "./payment/ThankYouScreen";
import BillingAddressForm from "./payment/BillingAddressForm";
import { currencyList } from "../../brandsPartner/currency";

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
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('card');
  const [showThankYou, setShowThankYou] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // ✅ NEW: Billing address state
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Redux selectors (existing code)
  const {
    selectedBrand,
    selectedAmount: giftFlowAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
    selectedOccasionName,
    isPaymentConfirmed,
  } = useSelector((state) => state.giftFlowReducer);

  const { bulkItems } = useSelector((state) => state.cart);
  const currentBulkOrder = isBulkMode && bulkItems.length > 0 ? bulkItems[bulkItems.length - 1] : null;

  // Derived values
  const selectedAmount = isBulkMode && currentBulkOrder ? currentBulkOrder.selectedAmount : giftFlowAmount;
  const quantity = isBulkMode && currentBulkOrder ? currentBulkOrder.quantity : 1;
  const companyInfo = isBulkMode && currentBulkOrder ? currentBulkOrder.companyInfo : null;
  const bulkDeliveryOption = isBulkMode && currentBulkOrder ? currentBulkOrder.deliveryOption : null;
  const csvRecipients = isBulkMode && currentBulkOrder ? currentBulkOrder.csvRecipients : [];

  // ✅ Validate billing address
  const validateBillingAddress = () => {
    const errors = {};

    if (!billingAddress.line1 || billingAddress.line1.trim() === '') {
      errors.line1 = 'Address is required';
    }
    if (!billingAddress.city || billingAddress.city.trim() === '') {
      errors.city = 'City is required';
    }
    if (!billingAddress.state || billingAddress.state.trim() === '') {
      errors.state = 'State is required';
    }
    if (!billingAddress.postalCode || billingAddress.postalCode.trim() === '') {
      errors.postalCode = 'Postal code is required';
    }
    if (!billingAddress.country || billingAddress.country.trim() === '') {
      errors.country = 'Country is required';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "";


  // Helper functions (existing)
  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${getCurrencySymbol(amount.currency)}${amount.value}`;
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

  // ✅ UPDATED: Initiate payment with billing address
  const handleInitiatePayment = async () => {
    // Validate billing address first
    if (!validateBillingAddress()) {
      toast.error('Please fill in all required billing address fields');
      return null;
    }

    if (clientSecret && pendingOrderId) {
      return { clientSecret, orderId: pendingOrderId };
    }

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Preparing your order...');

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
        totalAmount: calculateTotal(),
        isBulkOrder: true,
        totalSpend: currentBulkOrder.totalSpend,
        billingAddress, // ✅ Include billing address
        deliveryMethod: bulkDeliveryOption === "multiple" ? "multiple" : "email",
        csvRecipients,
      } : {
        selectedBrand,
        selectedAmount,
        personalMessage,
        deliveryMethod,
        deliveryDetails,
        selectedOccasion,
        selectedSubCategory,
        selectedTiming,
        totalAmount: calculateTotal(),
        isBulkOrder: false,
        billingAddress, // ✅ Include billing address
      };


      console.log("orderData",orderData)

      const result = await createPendingOrder(orderData);

      if (result?.success) {
        setPendingOrderId(result.data.orderId);
        setClientSecret(result.data.clientSecret);
        toast.success('Ready to process payment', { id: toastId });
        return {
          clientSecret: result.data.clientSecret,
          orderId: result.data.orderId
        };
      } else {
        setError(result.error);
        toast.error(result.error, { id: toastId });
        return null;
      }
    } catch (error) {
      setError("Failed to prepare order.");
      toast.error('Failed to prepare order.', { id: toastId });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Payment success handler (existing code)
  const handlePaymentSuccess = (paymentIntent) => {
    console.log('💳 Payment intent succeeded:', paymentIntent.id);

    // Show immediate feedback
    toast.dismiss(); // Clear any existing toasts
    toast.loading('Confirming your order...', { id: 'payment-confirm' });

    setPaymentSubmitted(true);
    setIsProcessing(true);

    // Start polling with a slight delay to allow webhook to process
    setTimeout(() => {
      pollOrderStatus(pendingOrderId);
    }, 5000); // 1.5 second delay
  };

  const pollOrderStatus = async (orderId, attempts = 0) => {
    const maxAttempts = 30;
    const pollInterval = 2000;

    try {
      console.log(`🔍 Polling order status - Attempt ${attempts + 1}/${maxAttempts}`);
      const response = await getOrderStatus(orderId);

      const paymentStatus = response?.paymentStatus || response?.order?.paymentStatus;
      const orderData = response?.order || response;

      if (paymentStatus === 'COMPLETED') {
        setOrder(orderData);
        toast.success('Order placed successfully!');
        setIsProcessing(false);

        // ✅ Clear cart
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('storage'));

        return;
      }

      if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
        setError('Payment failed. Please try again.');
        toast.error('Payment failed');
        setIsProcessing(false);
        setPaymentSubmitted(false);
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(() => pollOrderStatus(orderId, attempts + 1), pollInterval);
      } else {
        toast.success(
          'Payment is being processed. Check your email for confirmation.',
          { duration: 6000 }
        );
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error polling:', error);
      if (attempts < maxAttempts) {
        setTimeout(() => pollOrderStatus(orderId, attempts + 1), pollInterval);
      } else {
        setError('Could not verify payment. Check your email.');
        toast.error('Failed to confirm payment');
        setIsProcessing(false);
      }
    }
  };

  const handleNext = () => {
    setShowThankYou(true);
  };

  // Render success screens (existing code)
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
        deliveryDetails={deliveryDetails}
      />
    );
  }

  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Received!</h1>
          <p className="text-gray-600">
            We've received your payment and are now confirming your order. You'll receive an email confirmation shortly.
          </p>
          {pendingOrderId && (
            <p className="text-sm text-gray-500 mt-4">
              Order ID: <span className="font-medium">{pendingOrderId}</span>
            </p>
          )}
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Confirming your order status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="min-h-screen bg-gray-50 px-4  py-30 md:px-8 md:py-30">
      <Toaster />
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
            onClick={() => { isBulkMode ? dispatch(setCurrentStep(7)) : dispatch(goBack()) }}
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mt-6">
            {isBulkMode
              ? 'Complete your payment securely'
              : "You're almost there!"}
          </h1>

          <p className="text-sm sm:text-base text-gray-600 text-center mt-2 max-w-2xl mx-auto">
            {isBulkMode
              ? 'Your vouchers will be generated instantly after payment'
              : "Let's deliver your beautiful gift and make someone's day absolutely wonderful"}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-5 sm:space-y-6">
            <BillingAddressForm
              address={billingAddress}
              onChange={setBillingAddress}
              errors={addressErrors}
            />

            <PaymentMethodSelector
              selectedTab={selectedPaymentTab}
              onTabChange={setSelectedPaymentTab}
              isBulkMode={isBulkMode}
            />

            {selectedPaymentTab === 'card' && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: 'stripe' },
                }}
              >
                <StripeCardPayment
                  clientSecret={clientSecret}
                  isProcessing={isProcessing}
                  onInitiatePayment={handleInitiatePayment}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}

            {selectedPaymentTab === 'card' && !clientSecret && (
              <button
                onClick={handleInitiatePayment}
                disabled={isProcessing || !isPaymentConfirmed}
                className={`w-full bg-gradient-to-r from-pink-500 to-orange-500 
                       hover:from-pink-600 hover:to-orange-600
                       disabled:from-gray-300 disabled:to-gray-400
                       text-white py-3 sm:py-4 px-6 rounded-xl
                       font-semibold text-sm sm:text-base
                       transition-all duration-200
                       flex items-center justify-center gap-2
                       shadow-lg disabled:cursor-not-allowed ${!isPaymentConfirmed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer '}`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Proceed to Payment <span>→</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5 sm:space-y-6">
            <GiftDetailsCard {...{
              selectedBrand,
              selectedAmount,
              selectedSubCategory,
              selectedOccasionName,
              personalMessage,
              deliveryMethod,
              deliveryDetails,
              formatAmount,
              isBulkMode,
              quantity,
              companyInfo,
            }} />

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
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <span className="text-red-600 font-bold">!</span>
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