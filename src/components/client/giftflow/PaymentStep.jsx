import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { goBack } from "../../../redux/giftFlowSlice";
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
    selectedOccasionName
  } = useSelector((state) => state.giftFlowReducer);

  const { bulkItems } = useSelector((state) => state.cart);
  const currentBulkOrder = isBulkMode && bulkItems.length > 0 ? bulkItems[bulkItems.length - 1] : null;

  // Derived values
  const selectedAmount = isBulkMode && currentBulkOrder ? currentBulkOrder.selectedAmount : giftFlowAmount;
  const quantity = isBulkMode && currentBulkOrder ? currentBulkOrder.quantity : 1;
  const companyInfo = isBulkMode && currentBulkOrder ? currentBulkOrder.companyInfo : null;
  const bulkDeliveryOption = isBulkMode && currentBulkOrder ? currentBulkOrder.deliveryOption : null;

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

  // Helper functions (existing)
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
    setPaymentSubmitted(true);
    pollOrderStatus(pendingOrderId);
  };

  // Poll order status (existing code)
  const pollOrderStatus = async (orderId, attempts = 0) => {
    const maxAttempts = 20;

    try {
      console.log('Polling order status for:', orderId, 'attempt:', attempts);
      const response = await getOrderStatus(orderId);
      console.log('Order status response:', response);

      if (response.paymentStatus === 'COMPLETED') {
        setOrder(response.order);
        toast.success('Order placed successfully!');
        setIsProcessing(false);
      } else if (response.paymentStatus === 'FAILED') {
        setError('Payment failed. Please try again.');
        toast.error('Payment failed');
        setIsProcessing(false);
      } else if (attempts < maxAttempts) {
        setTimeout(() => pollOrderStatus(orderId, attempts + 1), 1000);
      } else {
        toast.error('Payment is being processed. Check your email for confirmation.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error polling order status:', error);
      if (attempts < maxAttempts) {
        setTimeout(() => pollOrderStatus(orderId, attempts + 1), 1000);
      } else {
        setError('Could not verify payment status due to a network error. Please check your email for confirmation.');
        toast.error('Failed to confirm payment status.');
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
  <div className="min-h-screen bg-gray-50 px-4 py-12 sm:py-16 md:px-8 md:py-20">
  <Toaster />

  <div className="max-w-6xl mx-auto">
    {/* Header */}
    <div className="mb-6 sm:mb-8 mt-3">
      <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-full 
                     bg-white hover:bg-rose-50 transition-all duration-200 
                     shadow-sm hover:shadow-md"
        >
          <svg
            width="8"
            height="9"
            viewBox="0 0 8 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z"
              fill="url(#grad)"
            />
            <defs>
              <linearGradient id="grad" x1="7.5" y1="3" x2="-9" y2="13">
                <stop stopColor="#ED457D" />
                <stop offset="1" stopColor="#FA8F42" />
              </linearGradient>
            </defs>
          </svg>

          <span className="text-sm sm:text-base font-semibold text-gray-800">
            Previous
          </span>
        </button>
      </div>

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
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 
                       hover:from-pink-600 hover:to-orange-600
                       disabled:from-gray-300 disabled:to-gray-400
                       text-white py-3 sm:py-4 px-6 rounded-xl
                       font-semibold text-sm sm:text-base
                       transition-all duration-200
                       flex items-center justify-center gap-2
                       shadow-lg disabled:cursor-not-allowed"
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