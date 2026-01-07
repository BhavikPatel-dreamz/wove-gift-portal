'use client';

import React, { useState, useEffect } from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from 'react-hot-toast';
import { createPendingOrder, getOrderStatus } from '../../../lib/action/orderAction';
import { AlertCircle } from 'lucide-react';
import Header from '../../../components/client/home/Header';

// Import components from payment folder
import StripeCardPayment from "../giftflow/payment/StripeCardPayment";
import PaymentMethodSelector from "../giftflow/payment/PaymentMethodSelector";
import GiftDetailsCard from "../giftflow/payment/GiftDetailsCard";
import PaymentSummary from "../giftflow/payment/PaymentSummary";
import SuccessScreen from "../giftflow/payment/SuccessScreen";
import ThankYouScreen from "../giftflow/payment/ThankYouScreen";
import BillingAddressForm from "../giftflow/payment/BillingAddressForm";
import { ShoppingCart } from 'lucide-react';

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  // State
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('card');
  const [showThankYou, setShowThankYou] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // Billing address state
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Load cart from localStorage
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    if (items.length === 0) {
      window.location.href = '/';
    }
    setCartItems(items);
  }, []);

  // Helper functions
  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency}${amount.value}`;
    }
    if (typeof amount === 'number') {
      return `R${amount}`;
    }
    return `R${amount || 0}`;
  };

  const getAmountValue = (amount) => {
    if (typeof amount === 'object' && amount?.value) {
      return Number(amount.value) || 0;
    }
    return Number(amount) || 0;
  };

  const getCurrency = () => {
    if (cartItems.length > 0) {
      const firstAmount = cartItems[0].selectedAmount;
      if (typeof firstAmount === 'object' && firstAmount?.currency) {
        return firstAmount.currency;
      }
    }
    return 'R';
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + getAmountValue(item.selectedAmount);
    }, 0);
  };

  const calculateServiceFee = () => {
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * 0.03);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const serviceFee = calculateServiceFee();
    return subtotal + serviceFee;
  };

  const removeFromCart = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));

    if (updatedCart.length === 0) {
      window.location.href = '/cart';
    }
  };

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

  // Initiate payment with billing address
  const handleInitiatePayment = async () => {
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
      // Create orders for all cart items
      const orderPromises = cartItems.map(item => {
        const orderData = {
          selectedBrand: item.selectedBrand,
          selectedAmount: item.selectedAmount,
          personalMessage: item.personalMessage,
          deliveryMethod: item.deliveryMethod,
          deliveryDetails: item.deliveryDetails,
          selectedOccasion: item.selectedOccasion,
          selectedSubCategory: item.selectedSubCategory,
          selectedTiming: item.selectedTiming,
          totalAmount: calculateTotal(),
          isBulkOrder: false,
          billingAddress,
        };
        return createPendingOrder(orderData);
      });

      const results = await Promise.all(orderPromises);

      // Use the first successful order's client secret
      const successfulResult = results.find(r => r?.success);

      if (successfulResult) {
        setPendingOrderId(successfulResult.data.orderId);
        setClientSecret(successfulResult.data.clientSecret);
        toast.success('Ready to process payment', { id: toastId });
        return {
          clientSecret: successfulResult.data.clientSecret,
          orderId: successfulResult.data.orderId
        };
      } else {
        setError('Failed to prepare orders');
        toast.error('Failed to prepare orders', { id: toastId });
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

  // Payment success handler
  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentSubmitted(true);
    pollOrderStatus(pendingOrderId);
  };

  // Poll order status
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
        // Clear cart
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('storage'));
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

  // Render success screens
  if (order) {
    if (showThankYou) {
      return (
        <div>
          <Header />
          <ThankYouScreen />;
        </div>
      )
    }

    return (
      <div>
        <Header />
        <SuccessScreen
          order={order}
          selectedBrand={cartItems[0]?.selectedBrand}
          quantity={cartItems.length}
          selectedAmount={cartItems[0]?.selectedAmount}
          isBulkMode={false}
          onNext={handleNext}
        />
      </div>
    );
  }

  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Header />
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
    <div className="min-h-screen bg-gray-50 py-8 ">
      <Header />
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {/* Back Button */}
        <div className="relative flex flex-col items-start gap-4 mb-6 md:flex-row md:items-center md:justify-between md:gap-0">
          <button
            className="relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-base text-[#4A4A4A] bg-white border border-transparent transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => window.history.back()}
          >
            <span className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-r from-[#ED457D] to-[#FA8F42]"></span>
            <span className="absolute inset-[1.5px] rounded-full bg-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#ED457D] group-hover:to-[#FA8F42]"></span>
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
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mt-6">
            You're almost there!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2 max-w-2xl mx-auto">
            Let's deliver your beautiful gift and make someone's day absolutely wonderful
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
              isBulkMode={false}
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
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
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
            <GiftDetailsCard
              cartItems={cartItems}
              formatAmount={formatAmount}
              onRemoveItem={removeFromCart}
              isProcessing={isProcessing}
            />

            <PaymentSummary
              selectedAmount={{ value: calculateSubtotal(), currency: getCurrency() }}
              formatAmount={formatAmount}
              calculateServiceFee={calculateServiceFee}
              calculateTotal={calculateTotal}
              isBulkMode={false}
              quantity={cartItems.length}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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

export default CheckoutPage;