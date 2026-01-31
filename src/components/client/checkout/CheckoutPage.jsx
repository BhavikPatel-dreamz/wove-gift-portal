'use client';

import React, { useState, useEffect } from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from 'react-hot-toast';
import { createPendingOrder, getOrderStatus } from '../../../lib/action/orderAction';
import { AlertCircle, Package, ShoppingBag, CheckCircle2, Clock } from 'lucide-react';
import Header from '../../../components/client/home/Header';
import { useSession } from '@/contexts/SessionContext';

// Import components from payment folder
import StripeCardPayment from "../giftflow/payment/StripeCardPayment";
import PaymentMethodSelector from "../giftflow/payment/PaymentMethodSelector";
import SuccessScreen from "../giftflow/payment/SuccessScreen";
import ThankYouScreen from "../giftflow/payment/ThankYouScreen";
import BillingAddressForm from "../giftflow/payment/BillingAddressForm";
import { currencyList } from '../../brandsPartner/currency';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, clearBulkCart } from '@/redux/cartSlice';

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const session = useSession();

  // Get cart items from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const bulkItems = useSelector((state) => state.cart.bulkItems);

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('card');
  const [showThankYou, setShowThankYou] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderIds, setPendingOrderIds] = useState([]);
  const [processingStatus, setProcessingStatus] = useState(null);
  
  // ✅ Track individual order processing
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

  // Check if cart is empty and redirect
  useEffect(() => {
    if (cartItems.length === 0 && bulkItems.length === 0) {
      window.location.href = '/';
    }
  }, [cartItems, bulkItems]);

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

  // ✅ Calculate totals for ALL items (regular + bulk combined)
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

  // ✅ UPDATED: Create pending orders for ALL items
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
      const allOrderPromises = [];
      const orderIdMap = {};

      // ✅ Process bulk items
      for (let i = 0; i < bulkItems.length; i++) {
        const bulkItem = bulkItems[i];
        const orderData = {
          selectedBrand: bulkItem.selectedBrand,
          selectedAmount: bulkItem.selectedAmount,
          personalMessage: bulkItem.personalMessage,
          quantity: bulkItem.quantity,
          companyInfo: bulkItem.companyInfo,
          deliveryOption: bulkItem.deliveryOption,
          selectedOccasion: bulkItem.selectedOccasion,
          selectedSubCategory: bulkItem.selectedSubCategory,
          totalAmount: getAmountValue(bulkItem.selectedAmount) * bulkItem.quantity,
          isBulkOrder: true,
          totalSpend: bulkItem.totalSpend,
          billingAddress,
          deliveryMethod: bulkItem.deliveryOption,
          csvRecipients: bulkItem.csvRecipients || [],
          userId: session?.user?.id,
        };

        allOrderPromises.push(
          createPendingOrder(orderData).then(result => ({
            ...result,
            type: 'bulk',
            index: i,
            itemData: bulkItem
          }))
        );
      }

      // ✅ Process regular cart items
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const orderData = {
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
        };

        allOrderPromises.push(
          createPendingOrder(orderData).then(result => ({
            ...result,
            type: 'regular',
            index: i,
            itemData: item
          }))
        );
      }

      // ✅ Wait for all orders to be created
      const results = await Promise.all(allOrderPromises);
      
      // ✅ Check if all succeeded
      const failedOrders = results.filter(r => !r?.success);
      if (failedOrders.length > 0) {
        const errorMsg = `Failed to create ${failedOrders.length} order(s)`;
        setError(errorMsg);
        toast.error(errorMsg, { id: toastId });
        return null;
      }

      // ✅ Get all order IDs and use the first clientSecret (they all share same payment)
      const orderIds = results.map(r => r.data.orderId);
      const sharedClientSecret = results[0].data.clientSecret;

      setPendingOrderIds(orderIds);
      setClientSecret(sharedClientSecret);

      // ✅ Initialize order status tracking
      const initialStatuses = {};
      results.forEach((result, idx) => {
        initialStatuses[result.data.orderId] = {
          status: 'PENDING',
          orderNumber: result.data.orderNumber,
          type: result.type,
          index: result.index
        };
      });
      setOrderStatuses(initialStatuses);

      toast.success(`${results.length} order(s) ready for payment`, { id: toastId });
      
      return {
        clientSecret: sharedClientSecret,
        orderIds: orderIds
      };
    } catch (error) {
      console.error('Error creating orders:', error);
      setError("Failed to prepare orders.");
      toast.error('Failed to prepare orders.', { id: toastId });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Payment success handler
  const handlePaymentSuccess = (paymentIntent) => {
    console.log('💳 Payment intent succeeded:', paymentIntent.id);
    console.log(`📦 Processing ${pendingOrderIds.length} orders`);

    toast.dismiss();
    toast.success('Payment received! Processing your orders...', { 
      id: 'payment-success',
      duration: 3000 
    });

    setPaymentSubmitted(true);
    setIsProcessing(true);
    setProcessingStatus('PAYMENT_CONFIRMED');

    // ✅ Start polling all orders
    setTimeout(() => {
      pollAllOrders(pendingOrderIds);
    }, 2000);
  };

  // ✅ Poll all orders simultaneously
  const pollAllOrders = async (orderIds, attempts = 0) => {
    const maxAttempts = 20;
    const pollInterval = 2000;

    try {
      console.log(`🔍 Polling ${orderIds.length} orders - Attempt ${attempts + 1}/${maxAttempts}`);

      // ✅ Poll all orders in parallel
      const statusPromises = orderIds.map(orderId => 
        getOrderStatus(orderId).catch(err => ({
          success: false,
          error: err.message,
          orderId
        }))
      );

      const responses = await Promise.all(statusPromises);

      // ✅ Update order statuses
      const updatedStatuses = { ...orderStatuses };
      let allCompleted = true;
      let anyFailed = false;

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

        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          anyFailed = true;
        }
      });

      setOrderStatuses(updatedStatuses);

      // ✅ Check if any order is ready to show
      const readyOrders = responses.filter(r => {
        const paymentStatus = r?.paymentStatus || r?.order?.paymentStatus;
        return paymentStatus === 'COMPLETED';
      });

      if (readyOrders.length > 0 && completedOrders.length === 0) {
        // ✅ At least one order completed - show success
        const completedOrdersData = readyOrders.map(r => r?.order || r);
        setCompletedOrders(completedOrdersData);
        setIsProcessing(false);
        
        toast.success(
          `${readyOrders.length} order(s) confirmed! ${
            readyOrders.length < responses.length 
              ? `${responses.length - readyOrders.length} still processing...` 
              : ''
          }`,
          { duration: 5000 }
        );

        // ✅ Clear carts
        if (bulkItems.length > 0) {
          dispatch(clearBulkCart());
        }
        if (cartItems.length > 0) {
          dispatch(clearCart());
        }

        return;
      }

      // ✅ All completed
      if (allCompleted) {
        const completedOrdersData = responses.map(r => r?.order || r);
        setCompletedOrders(completedOrdersData);
        setIsProcessing(false);
        
        toast.success('All orders completed successfully!', { duration: 3000 });

        // ✅ Clear carts
        if (bulkItems.length > 0) {
          dispatch(clearBulkCart());
        }
        if (cartItems.length > 0) {
          dispatch(clearCart());
        }

        return;
      }

      // ✅ Any failed
      if (anyFailed) {
        setError('Some orders failed. Please contact support.');
        toast.error('Some orders failed');
        setIsProcessing(false);
        return;
      }

      // ✅ Continue polling
      if (attempts < maxAttempts) {
        setTimeout(() => pollAllOrders(orderIds, attempts + 1), pollInterval);
      } else {
        // ✅ Max attempts - show what we have
        toast.success(
          'Payment confirmed! Your orders are being processed. Check your email for updates.',
          { duration: 6000 }
        );
        
        const partialOrders = responses.filter(r => r?.order).map(r => r.order);
        if (partialOrders.length > 0) {
          setCompletedOrders(partialOrders);
        }
        setIsProcessing(false);

        // ✅ Clear carts anyway
        if (bulkItems.length > 0) {
          dispatch(clearBulkCart());
        }
        if (cartItems.length > 0) {
          dispatch(clearCart());
        }
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

  // ✅ Success screens
  if (completedOrders.length > 0) {
    if (showThankYou) {
      return (
        <div>
          <Header />
          <ThankYouScreen />
        </div>
      );
    }

    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {completedOrders.length === 1 ? 'Order Confirmed!' : `${completedOrders.length} Orders Confirmed!`}
                </h1>
                <p className="text-gray-600">
                  Your payment has been processed successfully
                </p>
              </div>

              {/* ✅ Show all completed orders */}
              <div className="space-y-4 mb-8">
                {completedOrders.map((order, idx) => (
                  <div key={order.id || idx} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #{idx + 1}</p>
                        <p className="font-semibold text-lg">{order.orderNumber}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </div>
                    </div>
                    
                    {order.brand && (
                      <div className="flex items-center gap-3">
                        <img 
                          src={order.brand.logo} 
                          alt={order.brand.brandName}
                          className="w-12 h-12 object-contain rounded-lg border"
                        />
                        <div>
                          <p className="font-medium">{order.brand.brandName}</p>
                          <p className="text-sm text-gray-600">
                            {getCurrencySymbol(order.currency)}{order.amount}
                            {order.quantity > 1 && ` × ${order.quantity}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Processing screen
  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Header />
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Received!
              </h1>
              <p className="text-gray-600">
                Processing {pendingOrderIds.length} order{pendingOrderIds.length > 1 ? 's' : ''}...
              </p>
            </div>

            {/* ✅ Order processing status */}
            <div className="space-y-3 mb-6">
              {pendingOrderIds.map((orderId, idx) => {
                const status = orderStatuses[orderId];
                const isProcessing = status?.paymentStatus === 'COMPLETED' && status?.processingStatus === 'IN_PROGRESS';
                const isCompleted = status?.paymentStatus === 'COMPLETED' && status?.processingStatus === 'COMPLETED';
                const isPending = !status?.paymentStatus || status?.paymentStatus === 'PENDING';

                return (
                  <div key={orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {status?.type === 'bulk' ? (
                        <Package className="w-5 h-5 text-pink-500" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-pink-500" />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-sm">Order #{idx + 1}</p>
                        <p className="text-xs text-gray-500">{status?.orderNumber || orderId.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="text-green-600 flex items-center gap-1 text-sm">
                          <CheckCircle2 className="w-4 h-4" /> Done
                        </span>
                      )}
                      {isProcessing && (
                        <span className="text-blue-600 flex items-center gap-1 text-sm">
                          <Clock className="w-4 h-4 animate-spin" /> Processing
                        </span>
                      )}
                      {isPending && (
                        <div className="animate-spin h-4 w-4 border-2 border-pink-500 border-t-transparent rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-pink-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(Object.values(orderStatuses).filter(s => s?.paymentStatus === 'COMPLETED').length / pendingOrderIds.length) * 100}%` 
                }}
              />
            </div>

            <p className="text-sm text-gray-500">
              This may take a few moments. Please don't close this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main payment form
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
                    Preparing {cartItems.length + bulkItems.length} order{cartItems.length + bulkItems.length > 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    Proceed to Payment <span>→</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-5 sm:space-y-6">
            {/* ✅ Order Items Preview */}
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

            {/* ✅ Payment Summary */}
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
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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