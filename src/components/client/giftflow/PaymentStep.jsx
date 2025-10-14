import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Shield, Check, CreditCard, Gift } from "lucide-react";
import { goBack, setSelectedPaymentMethod } from "../../../redux/giftFlowSlice";
import { createOrder } from "../../../lib/action/orderAction";
import toast, { Toaster } from 'react-hot-toast';
import { MessageCircle } from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import convertToSubcurrency from "../../../lib/convertToSubcurrency";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Stripe Card Payment Component
const StripeCardPayment = ({ total, isProcessing, onPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);

  const handleCardPayment = async () => {
    if (!stripe || !elements) return;

    setCardError(null);
    const cardElement = elements.getElement(CardElement);

    try {
      const { error, token } = await stripe.createToken(cardElement);
      if (error) {
        setCardError(error.message);
        toast.error(error.message);
        return;
      }

      // Send token to backend for payment processing
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/process-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.id,
          amount: total,
          currency: 'usd',
        }),
      });

      const result = await response.json();

      if (result.success) {
        await onPayment({
          method: 'card',
          token: token.id,
          chargeId: result.chargeId,
          brand: token.card.brand,
          last4: token.card.last4
        });
      } else {
        setCardError(result.error || 'Payment failed');
        toast.error(result.error || 'Payment failed');
      }
    } catch (err) {
      setCardError("Payment failed. Please try again.");
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">Card Details</label>
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
          className="p-3 border border-gray-300 rounded-lg"
        />
      </div>
      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {cardError}
        </div>
      )}
      <button
        onClick={handleCardPayment}
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Pay ${(total / 100).toFixed(2)}</span>
          </>
        )}
      </button>
    </div>
  );
};

// Main Payment Step Component
const PaymentStep = () => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const {
    selectedBrand,
    selectedAmount,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedOccasion,
    selectedSubCategory,
    selectedTiming,
  } = useSelector((state) => state.giftFlowReducer);

  const formatAmount = (amount) => {
    if (typeof amount === 'object' && amount?.value && amount?.currency) {
      return `${amount.currency} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  const calculateServiceFee = () => {
    const baseAmount = selectedAmount?.value || 0;
    return Math.round(baseAmount * 0.03);
  };

  const calculateTotal = () => {
    const baseAmount = selectedAmount?.value || 0;
    const serviceFee = calculateServiceFee();
    return baseAmount + serviceFee;
  };

  const handlePayment = async (paymentData) => {
    setIsProcessing(true);
    setError(null);
    const toastId = toast.loading('Processing your order...');

    try {
      const orderData = {
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
      };

      const result = await createOrder(orderData);
      if (result?.success) {
        setOrder(result?.data?.order);
        toast.success('Order placed successfully!', { id: toastId });
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

  if (order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 md:p-6 flex items-center justify-center">
        <Toaster />
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
          <div className="bg-gray-50 rounded-xl p-6 space-y-4 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number:</span>
              <span className="font-semibold text-gray-800">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-semibold text-gray-800">{order.currency} {order.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-semibold text-gray-800 capitalize">{order.paymentMethod}</span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
          >
            Send Another Gift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => dispatch(goBack())}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Previous</span>
          </button>

          <h1 className="text-4xl font-bold text-gray-900">You're almost there!</h1>
          <p className="text-gray-600 mt-2">Let's deliver your beautiful gift and make someone's day absolutely wonderful</p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Column - Payment Method */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-pink-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Secure card payment</p>

              {/* Security Notice */}
              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start">
                <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">Your payment is 100% secure and encrypted</span>
              </div>

              {/* Payment Method Card */}
              <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm">Credit or Debit Card</h4>
                    <p className="text-xs text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="mt-5">
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
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-3 space-y-6">
            {/* Gift Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Gift className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Your Beautiful Gift</h3>
                <span className="ml-auto text-2xl">🎁</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Ready to make someone smile</p>

              {/* Gift Card */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    {selectedBrand?.logo ? (
                      <img
                        src={selectedBrand.logo}
                        alt={selectedBrand.brandName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {(selectedBrand?.brandName || 'SB')?.substring(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedBrand?.brandName || 'Gift Card'}</h4>
                    <span className="text-lg font-bold text-gray-900">{formatAmount(selectedAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  "{personalMessage}"
                </p>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">
                  <span className="font-semibold">Delivering via {deliveryMethod?.toUpperCase()}</span>
                </span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Payment summary</h3>

              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gift Card Value</span>
                  <span className="font-semibold text-gray-900">{formatAmount(selectedAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Fee (3%)</span>
                  <span className="font-semibold text-gray-900">{selectedAmount?.currency}{calculateServiceFee()}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-2xl font-bold text-gray-900">{selectedAmount?.currency}{calculateTotal()}</span>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;