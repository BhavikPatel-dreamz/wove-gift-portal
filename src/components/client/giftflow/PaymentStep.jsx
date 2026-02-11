import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { goBack, setCurrentStep } from "../../../redux/giftFlowSlice";
import { createPendingOrder, getOrderStatus } from "../../../lib/action/orderAction";
import { useSession } from "@/contexts/SessionContext";

// Import components
import PaymentMethodSelector from "./payment/PaymentMethodSelector";
import GiftDetailsCard from "./payment/GiftDetailsCard";
import PaymentSummary from "./payment/PaymentSummary";
import BulkPaymentSummary from "./payment/BulkPaymentSummary";
import SuccessScreen from "./payment/SuccessScreen";
import ThankYouScreen from "./payment/ThankYouScreen";
import BillingAddressForm from "./payment/BillingAddressForm";
import { currencyList } from "../../brandsPartner/currency";

const PaymentStep = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useSession();
  const mode = searchParams.get('mode');
  const isBulkMode = mode === 'bulk';

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('card');
  const [showThankYou, setShowThankYou] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [payfastUrl, setPayfastUrl] = useState(null);

  // Processing status
  const [processingStatus, setProcessingStatus] = useState(null);

  // Billing address state
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'ZA', // South Africa default for PayFast
  });
  const [addressErrors, setAddressErrors] = useState({});

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

  // Auto-redirect when payfastUrl is set
  useEffect(() => {
    if (payfastUrl) {
      console.log('🚀 Redirecting to PayFast:', payfastUrl);
      window.location.href = payfastUrl;
    }
  }, [payfastUrl]);

  // Validate billing address
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

  // Helper functions
  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${getCurrencySymbol(amount.currency)}${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    return Math.round(totalAmount * 0.05);
  };

  const calculateTotal = () => {
    const baseAmount = selectedAmount?.value || 0;
    const totalAmount = isBulkMode ? baseAmount * quantity : baseAmount;
    const serviceFee = calculateServiceFee();
    return Number(totalAmount) + Number(serviceFee);
  };

  // Initiate payment with billing address
  const handleInitiatePayment = async () => {
    if (!validateBillingAddress()) {
      toast.error('Please fill in all required billing address fields');
      return null;
    }

    if (!isPaymentConfirmed) {
      toast.error('Please confirm that all details are correct');
      return null;
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
        billingAddress,
        deliveryMethod: bulkDeliveryOption === "multiple" ? "multiple" : "email",
        csvRecipients,
        userId: session?.user?.id,
        selectedTiming,
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
        billingAddress,
        userId: session?.user?.id,
      };

      const result = await createPendingOrder(orderData);

      if (result?.success) {
        setPendingOrderId(result.data.orderId);
        
        toast.success('Redirecting to payment...', { id: toastId });
        
        console.log('✅ PayFast URL received:', result.data.payfastUrl);
        
        // Set the URL to trigger redirect
        setPayfastUrl(result.data.payfastUrl);
        
        return {
          orderId: result.data.orderId
        };
      } else {
        setError(result.error);
        toast.error(result.error, { id: toastId });
        return null;
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError("Failed to prepare order.");
      toast.error('Failed to prepare order.', { id: toastId });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if returning from PayFast
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
      // The new success/cancel pages will handle the status.
      // This component doesn't need to do anything.
    }
  }, []);

  const handleNext = () => {
    setShowThankYou(true);
  };

  // Success screen
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
        processingInBackground={order.processingInBackground}
        processingStatus={order.processingStatus}
      />
    );
  }

  // Loading screen
  if (paymentSubmitted || payfastUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Redirecting to Payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we redirect you to PayFast secure payment gateway
          </p>
          {pendingOrderId && (
            <p className="text-sm text-gray-500 mt-4">
              Order ID: <span className="font-medium">{pendingOrderId}</span>
            </p>
          )}
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              Do not close this window...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="min-h-screen bg-gray-50 py-30 md:px-8 md:py-30">
      <Toaster />

      <div className="max-w-7xl mx-auto sm:px-6">
        {/* Back Button and Bulk Mode Indicator */}
        <div className="relative flex flex-col items-start gap-4 mb-6 md:flex-row md:items-center md:justify-between md:gap-0">
          <button
            className="relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-base text-[#4A4A4A] bg-white border border-transparent transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => { isBulkMode ? dispatch(setCurrentStep(7)) : dispatch(goBack()) }}
          >
            <span className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-r from-[#ED457D] to-[#FA8F42]"></span>
            <span className="absolute inset-[2px] rounded-full bg-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]"></span>
            <div className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:text-white">
              <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 group-hover:[&>path]:fill-white">
                <path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)" />
                <defs>
                  <linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ED457D" />
                    <stop offset="1" stopColor="#FA8F42" />
                  </linearGradient>
                </defs>
              </svg>
              Previous
            </div>
          </button>

          {isBulkMode && (
            <div className="flex items-center gap-3 justify-center w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:w-auto p-2">
              <div className="md:block w-30 h-px bg-gradient-to-r from-transparent via-[#FA8F42] to-[#ED457D]" />
              <div className="rounded-full p-px bg-gradient-to-r from-[#ED457D] to-[#FA8F42]">
                <div className="px-4 my-0.4 py-1.75 bg-white rounded-full">
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap">Bulk Gifting</span>
                </div>
              </div>
              <div className="md:block w-30 h-px bg-gradient-to-l from-transparent via-[#ED457D] to-[#FA8F42]" />
            </div>
          )}

          <div className="md:block w-[140px]" />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mt-6">
            {isBulkMode ? 'Complete your payment securely' : "You're almost there!"}
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

            {/* PayFast Payment Button */}
            {selectedPaymentTab === 'payfast' && (
              <button
                onClick={handleInitiatePayment}
                disabled={isProcessing || !isPaymentConfirmed}
                className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 
                       hover:from-blue-600 hover:to-blue-700
                       disabled:from-gray-300 disabled:to-gray-400
                       text-white py-3 sm:py-4 px-6 rounded-xl
                       font-semibold text-sm sm:text-base
                       transition-all duration-200
                       flex items-center justify-center gap-2
                       shadow-lg disabled:cursor-not-allowed ${!isPaymentConfirmed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Redirecting to PayFast...
                  </>
                ) : (
                  <>
                    Pay with PayFast <span>→</span>
                  </>
                )}
              </button>
            )}

            {/* Card Payment Button */}
            {selectedPaymentTab === 'card' && (
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
                       shadow-lg disabled:cursor-not-allowed ${!isPaymentConfirmed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Redirecting to PayFast...
                  </>
                ) : (
                  <>
                    Pay with Card <span>→</span>
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
          <div className="mt-4 sm:mt-6">
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 sm:gap-4">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm sm:text-base">!</span>
              <div className="flex-1 max-w-full">
                <p className="font-semibold text-red-800 text-sm sm:text-base">Payment Error</p>
                <p className="text-xs sm:text-sm text-red-700 mt-0.5 wrap-break-word">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;