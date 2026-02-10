'use client';

import React, { useState, useEffect } from 'react';
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from 'react-hot-toast';
import { createPendingOrder, getOrderStatus, completeOrderAfterPayment } from '../../../lib/action/orderAction';
import { AlertCircle, Package, ShoppingBag, CheckCircle2, Clock, Mail, Phone, MapPin, Users, Calendar, Loader2 } from 'lucide-react';
import Header from '../../../components/client/home/Header';
import { useSession } from '@/contexts/SessionContext';
// import StripeCardPayment from "../giftflow/payment/StripeCardPayment";
import PaymentMethodSelector from "../giftflow/payment/PaymentMethodSelector";
import ThankYouScreen from "../giftflow/payment/ThankYouScreen";
import BillingAddressForm from "../giftflow/payment/BillingAddressForm";
import SuccessScreen from "../giftflow/payment/SuccessScreen";
import { currencyList } from '../../brandsPartner/currency';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, clearBulkCart } from '@/redux/cartSlice';
import { resetFlow } from '../../../redux/giftFlowSlice';

// ✅ STRIPE CODE COMMENTED OUT
// if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
//   throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
// }
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const session = useSession();

  // Get cart items from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const bulkItems = useSelector((state) => state.cart.bulkItems);
  const {
    isPaymentConfirmed,
  } = useSelector((state) => state.giftFlowReducer);

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [sharedPaymentIntentId, setSharedPaymentIntentId] = useState(null);

  // Track individual order processing
  const [orderStatuses, setOrderStatuses] = useState({});

  // Billing address state
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [addressErrors, setAddressErrors] = useState({});

  const getCurrencySymbol = (code) =>
    currencyList.find((c) => c.code === code)?.symbol || "R";

  // Helper functions
  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${getCurrencySymbol(amount.currency)}${amount.value}`;
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
    if (bulkItems.length > 0) {
      const firstAmount = bulkItems[0].selectedAmount;
      if (typeof firstAmount === 'object' && firstAmount?.currency) {
        return firstAmount.currency;
      }
    }
    return 'ZAR';
  };

  // Calculate totals for ALL items (regular + bulk combined)
  const calculateCombinedSubtotal = () => {
    const regularSubtotal = cartItems.reduce((total, item) => {
      return total + getAmountValue(item.selectedAmount);
    }, 0);

    const bulkSubtotal = bulkItems.reduce((total, item) => {
      const value = getAmountValue(item.selectedAmount);
      return total + (value * item.quantity);
    }, 0);

    return regularSubtotal + bulkSubtotal;
  };

  const calculateCombinedServiceFee = () => {
    const subtotal = calculateCombinedSubtotal();
    return Math.round(subtotal * 0.05);
  };

  const calculateCombinedTotal = () => {
    return calculateCombinedSubtotal() + calculateCombinedServiceFee();
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

  // Create separate pending orders for ALL cart items
  const handleInitiatePayment = async () => {
    if (!validateBillingAddress()) {
      toast.error('Please fill in all required billing address fields');
      return null;
    }

    if (clientSecret && pendingOrderIds.length > 0) {
      return { clientSecret, orderIds: pendingOrderIds };
    }

    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Preparing your orders...');

    try {
      const allOrderIds = [];
      const orderMetadata = [];

      // Collect all items (bulk + regular)
      const allItems = [
        ...bulkItems.map((item, i) => ({ ...item, type: 'bulk', index: i })),
        ...cartItems.map((item, i) => ({ ...item, type: 'regular', index: i }))
      ];

      console.log(`📦 Creating ${allItems.length} orders...`);

      let sharedPaymentIntentId = null;
      let sharedClientSecret = null;
      let sharedCustomerId = null;

      // Process each item sequentially
      for (let idx = 0; idx < allItems.length; idx++) {
        const item = allItems[idx];
        const isBulkItem = item.type === 'bulk';

        // Build order data
        let orderData;
        if (isBulkItem) {
          orderData = {
            selectedBrand: item.selectedBrand,
            selectedAmount: item.selectedAmount,
            personalMessage: item.personalMessage,
            quantity: item.quantity,
            companyInfo: item.companyInfo,
            deliveryOption: item.deliveryOption,
            selectedOccasion: item.selectedOccasion,
            selectedSubCategory: item.selectedSubCategory,
            totalAmount: getAmountValue(item.selectedAmount) * item.quantity,
            isBulkOrder: true,
            totalSpend: item.totalSpend,
            billingAddress,
            deliveryMethod: item.deliveryOption,
            csvRecipients: item.csvRecipients || [],
            userId: session?.user?.id,
            sharedPaymentIntentId: sharedPaymentIntentId,
            customerId: sharedCustomerId,
          };
        } else {
          orderData = {
            selectedBrand: item.selectedBrand,
            selectedAmount: item.selectedAmount,
            personalMessage: item.personalMessage,
            deliveryMethod: item.deliveryMethod,
            deliveryDetails: item.deliveryDetails,
            selectedOccasion: item.selectedOccasion,
            selectedSubCategory: item.selectedSubCategory,
            selectedTiming: item.selectedTiming,
            totalAmount: getAmountValue(item.selectedAmount),
            isBulkOrder: false,
            billingAddress,
            userId: session?.user?.id,
            sharedPaymentIntentId: sharedPaymentIntentId,
            customerId: sharedCustomerId,
          };
        }

        console.log(`Creating order ${idx + 1}/${allItems.length}...`);

        const result = await createPendingOrder(orderData);

        if (!result.success) {
          throw new Error(`Failed to create order ${idx + 1}: ${result.error}`);
        }

        allOrderIds.push(result.data.orderId);

        // ✅ No payment intent tracking needed for test mode
        // if (idx === 0) {
        //   sharedPaymentIntentId = result.data.paymentIntentId;
        //   sharedClientSecret = result.data.clientSecret;
        //   sharedCustomerId = result.data.customerId;
        //   console.log(`✅ First order created - Payment Intent: ${sharedPaymentIntentId}`);
        // }

        // Store metadata with full item details
        orderMetadata.push({
          type: item.type,
          brand: item.selectedBrand?.brandName,
          brandLogo: item.selectedBrand?.logo,
          amount: isBulkItem
            ? getAmountValue(item.selectedAmount) * item.quantity
            : getAmountValue(item.selectedAmount),
          quantity: item.quantity || 1,
          orderNumber: result.data.orderNumber,
          deliveryMethod: isBulkItem ? item.deliveryOption : item.deliveryMethod,
          deliveryDetails: item.deliveryDetails,
          csvRecipients: item.csvRecipients,
          personalMessage: item.personalMessage,
          occasion: item.selectedOccasion,
          timing: item.selectedTiming,
        });
      }

      console.log(`✅ Created ${allOrderIds.length} orders successfully`);

      setPendingOrderIds(allOrderIds);
      // setClientSecret(sharedClientSecret); // ✅ Not needed for test mode

      // Initialize order status tracking with full details
      const initialStatuses = {};
      allOrderIds.forEach((orderId, idx) => {
        initialStatuses[orderId] = {
          status: 'PENDING',
          orderNumber: orderMetadata[idx].orderNumber,
          type: orderMetadata[idx].type,
          index: idx,
          metadata: orderMetadata[idx],
        };
      });
      setOrderStatuses(initialStatuses);

      toast.success(`${allOrderIds.length} order(s) ready for payment`, { id: toastId });

      return {
        // clientSecret: sharedClientSecret, // ✅ Not needed for test mode
        orderIds: allOrderIds
      };

    } catch (error) {
      console.error('Error creating orders:', error);
      setError(error.message || "Failed to prepare orders.");
      toast.error(error.message || 'Failed to prepare orders.', { id: toastId });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  console.log("cartItems", cartItems, bulkItems);

  // ✅ TEST MODE: Simulate payment success
  const handlePaymentSuccess = async (orderIds) => {
    console.log('🧪 TEST MODE: Simulating payment success for orders:', orderIds);

    if (!orderIds || orderIds.length === 0) {
      console.error('❌ No order IDs provided to handlePaymentSuccess');
      toast.error('Order IDs missing');
      return;
    }

    toast.dismiss();
    toast.success('Payment received! Processing your orders...', {
      id: 'payment-success',
      duration: 3000
    });

    setPaymentSubmitted(true);
    setIsProcessing(true);
    setProcessingStatus('PAYMENT_CONFIRMED');

    // ✅ Simulate webhook by calling completeOrderAfterPayment for each order
    setTimeout(async () => {
      try {
        console.log(`🔄 Processing ${orderIds.length} orders...`);

        for (const orderId of orderIds) {
          console.log(`📦 Completing order: ${orderId}`);
          
          await completeOrderAfterPayment(orderId, {
            paymentIntentId: 'test_pi_' + Date.now(), // Mock payment intent
            paymentMethod: 'card',
            amount: calculateCombinedTotal() * 100,
            currency: getCurrency().toLowerCase(),
          });
        }

        console.log('✅ All orders marked as completed, starting polling...');
        
        // Start polling after a short delay
        setTimeout(() => {
          pollAllOrders(orderIds);
        }, 2000);

      } catch (error) {
        console.error('❌ Error simulating payment:', error);
        toast.error('Failed to process payment');
        setIsProcessing(false);
        setPaymentSubmitted(false);
      }
    }, 1500); // Simulate network delay
  };

  // ✅ ENHANCED: Smarter polling with better status detection
  const pollAllOrders = async (orderIds, attempts = 0) => {
    const maxAttempts = 20;
    const pollInterval = 2000;

    try {
      console.log(`🔍 Polling ${orderIds.length} orders - Attempt ${attempts + 1}/${maxAttempts}`);

      const statusPromises = orderIds.map(orderId =>
        getOrderStatus(orderId).catch(err => ({
          success: false,
          error: err.message,
          orderId
        }))
      );

      const responses = await Promise.all(statusPromises);

      const updatedStatuses = { ...orderStatuses };
      let allCompleted = true;
      let anyFailed = false;
      let anyInProgress = false;

      responses.forEach((response, idx) => {
        const orderId = orderIds[idx];
        const paymentStatus = response?.paymentStatus || response?.order?.paymentStatus;
        const processingStatus = response?.processingStatus;

        updatedStatuses[orderId] = {
          ...updatedStatuses[orderId],
          paymentStatus,
          processingStatus,
          order: response?.order || response
        };

        if (paymentStatus !== 'COMPLETED') {
          allCompleted = false;
        }

        if (paymentStatus === 'COMPLETED' && processingStatus === 'IN_PROGRESS') {
          anyInProgress = true;
        }

        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          anyFailed = true;
        }
      });

      setOrderStatuses(updatedStatuses);

      // ✅ Show order as soon as payment is confirmed - like PaymentStep
      const confirmedOrders = responses.filter(r => {
        const paymentStatus = r?.paymentStatus || r?.order?.paymentStatus;
        return paymentStatus === 'COMPLETED';
      });

      if (confirmedOrders.length > 0 && !order) {
        const firstOrderData = confirmedOrders[0]?.order || confirmedOrders[0];

        // Set single order like PaymentStep
        setOrder({
          ...firstOrderData,
          processingInBackground: anyInProgress,
          processingStatus: confirmedOrders[0]?.processingStatus || 'IN_PROGRESS',
          allOrders: responses.map(r => r?.order || r),
          totalOrderCount: orderIds.length
        });
        setIsProcessing(false);
        dispatch(resetFlow());

        if (anyInProgress) {
          toast.success(
            orderIds.length === 1
              ? 'Order confirmed! Gift card is being generated...'
              : `${confirmedOrders.length} order(s) confirmed! Gift cards are being generated...`,
            { duration: 5000 }
          );
        } else {
          toast.success('All orders completed successfully!', { duration: 3000 });
        }

        if (bulkItems.length > 0) dispatch(clearBulkCart());
        if (cartItems.length > 0) dispatch(clearCart());
        return;
      }

      // ✅ All processing completed
      if (allCompleted && !anyInProgress && order) {
        const firstOrderData = responses[0]?.order || responses[0];

        setOrder({
          ...firstOrderData,
          processingInBackground: false,
          processingStatus: 'COMPLETED',
          allOrders: responses.map(r => r?.order || r),
          totalOrderCount: orderIds.length
        });
        setIsProcessing(false);

        toast.success('All orders completed successfully!', { duration: 3000 });

        if (bulkItems.length > 0) dispatch(clearBulkCart());
        if (cartItems.length > 0) dispatch(clearCart());
        return;
      }

      if (anyFailed) {
        setError('Some orders failed. Please contact support.');
        toast.error('Some orders failed');
        setIsProcessing(false);
        return;
      }

      // Continue polling
      if (attempts < maxAttempts) {
        setTimeout(() => pollAllOrders(orderIds, attempts + 1), pollInterval);
      } else {
        // Max attempts reached - show success anyway
        toast.success(
          'Payment confirmed! Your orders are being processed. Check your email for updates.',
          { duration: 6000 }
        );

        const firstOrderData = responses.filter(r => r?.order)[0]?.order || responses[0];

        if (firstOrderData) {
          setOrder({
            ...firstOrderData,
            processingInBackground: true,
            processingStatus: 'IN_PROGRESS',
            allOrders: responses.map(r => r?.order || r),
            totalOrderCount: orderIds.length
          });
        }
        setIsProcessing(false);

        if (bulkItems.length > 0) dispatch(clearBulkCart());
        if (cartItems.length > 0) dispatch(clearCart());
      }
    } catch (error) {
      console.error('Error polling orders:', error);
      if (attempts < maxAttempts) {
        setTimeout(() => pollAllOrders(orderIds, attempts + 1), pollInterval);
      } else {
        setError('Could not verify all orders. Check your email for confirmation.');
        toast.error('Failed to confirm all orders');
        setIsProcessing(false);
      }
    }
  };

  const handleNext = () => {
    setShowThankYou(true);
  };

  // ✅ Success screen - using SuccessScreen component like PaymentStep
  if (order) {
    if (showThankYou) {
      return (
        <div>
          <Header />
          <ThankYouScreen />
        </div>
      );
    }

    // Calculate quantity for display (sum of all orders or single order)
    const displayQuantity = order.totalOrderCount || 1;
    const isBulkMode = order.totalOrderCount > 1 || (order.quantity && order.quantity > 1);

    return (
      <SuccessScreen
        order={order}
        selectedBrand={order.brand || cartItems[0]?.selectedBrand || bulkItems[0]?.selectedBrand}
        quantity={displayQuantity}
        selectedAmount={order.selectedAmount || order.amount}
        isBulkMode={isBulkMode}
        onNext={handleNext}
        deliveryDetails={order.deliveryDetails}
        processingInBackground={order.processingInBackground}
        processingStatus={order.processingStatus}
      />
    );
  }

  // ✅ Simple loading screen - EXACTLY like PaymentStep
  if (paymentSubmitted) {
    const totalOrders = pendingOrderIds.length;
    const hasBulkOrders = bulkItems.length > 0;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Header />
        <div className="max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {processingStatus === 'PAYMENT_CONFIRMED' ? 'Payment Received!' : 'Processing Your Order...'}
          </h1>
          <p className="text-gray-600">
            {processingStatus === 'PAYMENT_CONFIRMED'
              ? "We've received your payment and are now preparing your orders."
              : "Confirming your orders and generating gift cards..."}
          </p>
          {pendingOrderIds.length > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              {totalOrders === 1
                ? `Order ID: ${pendingOrderIds[0].slice(0, 8)}`
                : `${totalOrders} Orders`}
            </p>
          )}
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              {totalOrders > 1
                ? `Processing ${totalOrders} orders...`
                : 'Preparing your gift card...'}
            </p>
          </div>

          {/* Progress indicator for multiple orders */}
          {totalOrders > 1 && (
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: '40%' }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Header />
      <Toaster />
      <div className="max-w-7xl mx-auto sm:px-6 py-20">
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
            Complete Your Order
          </h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2 max-w-2xl mx-auto">
            {cartItems.length + bulkItems.length} item{cartItems.length + bulkItems.length > 1 ? 's' : ''} ready for checkout
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Payment */}
          <div className="space-y-5 sm:space-y-6">
            <BillingAddressForm
              address={billingAddress}
              onChange={setBillingAddress}
              errors={addressErrors}
            />

            <PaymentMethodSelector
              selectedTab={selectedPaymentTab}
              onTabChange={setSelectedPaymentTab}
              isBulkMode={bulkItems.length > 0}
            />

            {/* ✅ STRIPE CARD PAYMENT COMMENTED OUT */}
            {/* {selectedPaymentTab === 'card' && clientSecret && (
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
            )} */}

            {/* ✅ TEST MODE: Simple payment button */}
            {selectedPaymentTab !== '' && (
              <button
                onClick={async () => {
                  const result = await handleInitiatePayment();
                  if (result && result.orderIds) {
                    // Simulate payment success after orders are created
                    handlePaymentSuccess(result.orderIds);
                  }
                }}
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
                    {pendingOrderIds.length > 0 ? 'Processing Payment...' : `Preparing ${cartItems.length + bulkItems.length} order${cartItems.length + bulkItems.length > 1 ? 's' : ''}...`}
                  </>
                ) : (
                  <>
                    {pendingOrderIds.length > 0 ? 'Complete Payment' : 'Proceed to Payment'} <span>→</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-5 sm:space-y-6 text-black">
            {/* Order Items Preview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary ({cartItems.length + bulkItems.length} items)
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* Regular Items */}
                {cartItems.map((item, idx) => (
                  <div key={`regular-${idx}`} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 shrink-0">
                      <img
                        src={item.selectedBrand?.logo}
                        alt={item.selectedBrand?.brandName}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.selectedBrand?.brandName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatAmount(item.selectedAmount)}
                      </p>
                    </div>
                    <ShoppingBag className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}

                {/* Bulk Items */}
                {bulkItems.map((item, idx) => (
                  <div key={`bulk-${idx}`} className="flex gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="w-12 h-12 shrink-0">
                      <img
                        src={item.selectedBrand?.logo}
                        alt={item.selectedBrand?.brandName}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.selectedBrand?.brandName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatAmount(item.selectedAmount)} × {item.quantity}
                      </p>
                    </div>
                    <Package className="w-4 h-4 text-pink-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{getCurrencySymbol(getCurrency())} {calculateCombinedSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service Fee (5%)</span>
                  <span>{getCurrencySymbol(getCurrency())} {calculateCombinedServiceFee()}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">
                    {getCurrencySymbol(getCurrency())} {calculateCombinedTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
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