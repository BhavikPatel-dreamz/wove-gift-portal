import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from 'react-hot-toast';

const StripeCardPayment = ({ clientSecret, isProcessing, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);

  const handleCardPayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setCardError(null);

    try {
      // Confirm payment using Stripe's confirmPayment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment/success',
        },
        redirect: 'if_required', // Don't redirect, handle inline
      });

      if (error) {
        // Payment failed
        setCardError(error.message);
        toast.error(error.message);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded - notify parent
        // Webhook will update DB, we just poll for status
        onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      setCardError("Payment failed. Please try again.");
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Stripe Payment Element */}
      <div className="p-4 border border-gray-300 rounded-lg">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500" 
        />
        <span className="text-sm text-gray-700">Securely save this card for future gifts</span>
      </label>

      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {cardError}
        </div>
      )}

      <button
        onClick={handleCardPayment}
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Make Payment</span>
            <span>
              <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75 2.80128C7.75 3.37863 7.75 4.822 6.75 5.39935L2.25 7.99743C1.25 8.57478 0 7.85309 0 6.69839V1.50224C0 0.347537 1.25 -0.374151 2.25 0.2032L6.75 2.80128Z" fill="white" />
              </svg>
            </span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-600">
        By completing this payment, you agree to spread joy<br />and make someone's day special!
      </p>
    </div>
  );
};

export default StripeCardPayment;