import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from 'react-hot-toast';

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/process-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
              },
              invalid: { color: '#ef4444' },
            },
          }}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500" />
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